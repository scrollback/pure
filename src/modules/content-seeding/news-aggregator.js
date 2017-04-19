/* flow */
/* eslint-disable no-console, consistent-this, no-cond-assign */

import request from 'request';
import FeedParser from 'feedparser';

const req = request('http://bangalore.citizenmatters.in/rss');
const feedParser = new FeedParser({ addmeta: false });

export const newsAggregator = () => {
	return new Observable((observer) => {
		req.on('error', (error) => {
			observer.error(error);
		});

		req.on('response', (res) => {
			if (res.statusCode !== 200) {
				observer.error('Bad status code');
			}
			req.pipe(feedParser);
		});

		feedParser.on('error', (error) => {
			observer.error(error);
		});

		feedParser.on('readable', () => {
			let article;
			while (article = feedParser.read()) {
				observer.next(article);
			}
		});
	});
};

newsAggregator()
	.forEach((article) => {
		console.log(JSON.stringify(article, null, 2));
	})
	.catch((error) => {
		console.log(error);
	});
