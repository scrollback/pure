/* flow */
/* eslint-disable no-console, array-callback-return */

import feedParser from 'feed-read';
import { bus, config } from '../../core-server';
import winston from 'winston';
import * as pg from '../../lib/pg';
import promisify from '../../lib/promisify';
import uuid from 'node-uuid';
import { TYPE_THREAD, TAG_POST_NEWS_SEED, TAG_ROOM_NO_NEWS } from '../../lib/Constants';
import type { Thread } from '../../lib/schemaTypes';

/*
	Implementation Details:
		- TABLES:
			- FEEDS:
				column                   type
			  -----------------------------------------
			    url		                text
		        MTBU                    float(24)
				lastrequesttime         bigint
				lastupdatetime          bigint
			- ARTICLES:
				column                   type
			  -----------------------------------------
			    url		                text
		        rawjson                 jsonb
				terms    		        tsvector
			- POSTEDNEWS
				column                   type
			  -----------------------------------------
			    title		             text
		        url                 	 text
				roomid    		         text
				roomname 				 text
				createtime				 bigint

		- ALGORITHM:
			- Truncate the articles table.
			- Filter feeds where lastrequesttime < ( NOW() - Mean time between updates (MTBU) ).
			- For each feeds:
				- Check if the the given feed has some new news article (RSS FEED'S latest article timestamp > lastupdatetime).
				- If updated, update MTBU, lastrequesttime, lastupdatetime else update lastrequesttime only.
						MTBU = Average time interval at which a news story is added on that feed.
				- make a insert query in articles table with url, articleJson, and ts_vector(article_title + article_content).
				- select roomid, rawjson, url from rooms and articles table where terms lexemes match the room name.
				- join the above result with postednews table to check if the resultant post has already been posted and is
				  showing up due to change in published date on news edit.
				- For each result:
					- IF not posted already:
						- Construct a thread with title, url, description from articles and post it into relevent rooms.
						- Insert the thread into postednews table to keep track of news posted by the bot.
						- Delete from postednews table all the news that were posted before last 24 hours (it's okay to repost a news after 24 hrs !).
			- Invoke this job every hour.
*/


const JOB_INVOCATION_INTERVAL = 60 * 60 * 1000;
const ALLOWED_ARTICLE_AGE = 7 * 24 * 60 * 60 * 1000;
const ALLOWED_TRACKING_TIME = 24 * 60 * 60 * 1000;
const performReadQuery = promisify(pg.read.bind(pg, config.connStr));
const performWriteQuery = promisify(pg.write.bind(pg, config.connStr));
const parseFeed = promisify(feedParser.bind(feedParser));

type Article = {
	title: string;
	link: string;
	content: string;
	published: Date;
}

type FeedsObject = {
	url: string;
	mtbu: number;
	lastrequesttime: number;
	lastupdatetime: number
};

type RoomSpecificNews = {
	roomid: string;
	roomname: string;
	rawjson: Article;
	url: string
};

async function buildThreads (latestNewsForRooms: Array<RoomSpecificNews>): Thread {
	let timeStamp = Date.now();
	const changes = {
		entities: {}
	};
	winston.info('Inserting into postednews and building threads');
	// Construct query using pg cat for news insertion in postednews table and build threads.
	const query = 'INSERT INTO postednews (title, url, roomid, roomname, createtime) VALUES';
	const values = [];
	for (const newsArticle of latestNewsForRooms) {
		const id = uuid.v4();
		const createTime = timeStamp++;
		values.push({
			$: '(&{title}, &{url}, &{roomId}, &{roomName}, &{createTime})',
			title: newsArticle.rawjson.title,
			url: newsArticle.url,
			roomId: newsArticle.roomid,
			roomName: newsArticle.roomname,
			createTime
		});
		changes.entities[id] = {
			id,
			type: TYPE_THREAD,
			name: newsArticle.rawjson.title,
			body: newsArticle.url,
			tags: [ TAG_POST_NEWS_SEED ],
			parents: [ newsArticle.roomid ],
			identities: [],
			creator: 'belongbot',
			createTime
		};
	}
	const finalQuery = pg.cat([ query, pg.cat(values, ', ') ], '');
	/*
		- Insert into postednews table the threads to keep track of articles that are already posted.
		- Delete from postednews table the news that were posted before 24 hrs.
	*/
	await performWriteQuery([
		finalQuery,
		{
			$: 'DELETE FROM postednews WHERE createtime < (&{now}::bigint - &{ALLOWED_TRACKING_TIME}::bigint)',
			now: Date.now(),
			ALLOWED_TRACKING_TIME
		}
	]);
	winston.info('Successfully inserted latest news into postednews table !');
	return changes;
}

function getDueFeeds (): Promise<Array<FeedsObject>> {
	// select the feeds which are updated more frequently.
	return performReadQuery({
		$: 'SELECT * FROM feeds WHERE lastrequesttime < (extract(epoch from NOW()) * 1000 - mtbu)'
	});
}

function getRoomSpecificNews (): Promise<Array<RoomSpecificNews>> {
	/*
		- Select most recent relevent news article for each room (one for each room).
		- Remove the news that were already posted.
	*/
	return performReadQuery({
		$: `SELECT roomArticles.id AS roomid, roomArticles.name AS roomname, roomArticles.rawjson AS rawjson, roomArticles.url AS url FROM (
				SELECT * FROM rooms JOIN LATERAL (
					SELECT * FROM articles
		   			WHERE articles.terms @@ plainto_tsquery(rooms.name) AND NOT rooms.tags @> &{noNewsRoom}
		   			ORDER  BY articles.rawjson->>'published' DESC NULLS LAST LIMIT  1
				) article ON TRUE
			) as roomArticles LEFT OUTER JOIN postednews
			ON roomArticles.id::text = postednews.roomid AND roomArticles.url = postednews.url
			WHERE postednews.url IS NULL`,
		noNewsRoom: `{${TAG_ROOM_NO_NEWS}}`
	});
}

function insertNewArticles (articles: Array<Article>): Promise<Array<{ rowCount: number }>> {
	const query = 'INSERT INTO articles (url, rawjson, terms) VALUES';
	const values = [];
	articles.forEach(article => {
		values.push({
			$: '(&{url}, &{rawjson}, to_tsvector(&{contentForLexemes}))',
			url: article.link,
			rawjson: JSON.stringify(article),
			contentForLexemes: article.title + ' ' + article.content
		});
	});
	const finalQuery = pg.cat([ query, pg.cat(values, ', ') ], '');
	return performWriteQuery([ finalQuery ]);
}

function updateFeedsOnNewArticles (lastupdatetime: number, url: string, newArticlesCount: number): Promise<Array<{ rowCount: number }>> {
	return performWriteQuery([ {
		$: `UPDATE feeds SET lastrequesttime = extract(epoch from NOW()) * 1000,
			lastupdatetime = &{lastupdatetime}, mtbu = &{mtbu} 
			WHERE url=&{url}`,
		lastupdatetime,
		url,
		mtbu: (Date.now() - lastupdatetime) / newArticlesCount
	} ]);
}

function updateFeedsOnNoNewArtcles (url: string): Promise<Array<{ rowCount: number }>> {
	return performWriteQuery([ {
		$: 'UPDATE feeds SET lastrequesttime = extract(epoch from NOW()) * 1000 WHERE url=&{url}',
		url
	} ]);
}

export const newsAggregator = async () => {
	await performWriteQuery([ {
		$: 'TRUNCATE TABLE articles'
	} ]);
	// feeds: [{url: _, mtbu: _, lastrequesttime: _, lastupdatetime: _}, .....]
	const feeds = await getDueFeeds();
	await Promise.all(feeds.map(async feed => {
		try {
			winston.info(`parsing feed with url: ${feed.url}`);
			const newsArticles = await parseFeed(feed.url);
			/*
				CHECK FOR NEW ARTICLES:
					- checks:
						-> shouldn't be older than 1 week.
						-> Avoid duplicate stroies from the same feed.
						-> To avoid duplicate stories, compare article's pubdate with the lastupdatetime for that feed.
			*/
			let latestArticleDate = feed.lastupdatetime;
			const newNewsArticles = newsArticles.filter(newsArticle => {
				const articlePubDate = (new Date(newsArticle.published)).getTime();
				const articleAge = Date.now() - articlePubDate;
				const hasNewNewsArticle = articlePubDate > feed.lastupdatetime;
				latestArticleDate = Math.max(articlePubDate, latestArticleDate);
				return hasNewNewsArticle && articleAge <= ALLOWED_ARTICLE_AGE;
			});
			if (newNewsArticles.length > 0) {
				await Promise.all([
					updateFeedsOnNewArticles(latestArticleDate, feed.url, newNewsArticles.length),
					insertNewArticles(newNewsArticles)
				]);
			} else {
				await updateFeedsOnNoNewArtcles(feed.url);
			}
		} catch (e) {
			winston.warn(`Error while parsing ${feed.url}: ${e}`);
		}
	}));
};

export const postThreads = async () => {
	try {
		await newsAggregator();
		const roomSpecificNewsArticles = await getRoomSpecificNews();
		if (roomSpecificNewsArticles.length > 0) {
			const threads = await buildThreads(roomSpecificNewsArticles);
			winston.info(threads);
			bus.emit('change', threads);
		} else {
			winston.info('Duplicate or No new news stories found !!');
		}
	} catch (e) {
		winston.warn(`somethong went wrong while aggregating news, ${e}`);
	}
};

// Invoke this job every hour
setInterval(postThreads, JOB_INVOCATION_INTERVAL);
