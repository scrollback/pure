\echo 'Connecting to olsb'
\c hn heyneighbor hndb.c1mimw7qcvsb.ap-southeast-1.rds.amazonaws.com
--\c oldsb

DROP TABLE IF EXISTS id_map;

CREATE TABLE id_map (
	newid uuid,
	oldid text primary key
);

INSERT INTO id_map (newid, oldid) SELECT gen_random_uuid(), id FROM entities WHERE type = 'room';
INSERT INTO id_map (newid, oldid) SELECT gen_random_uuid(), id FROM threads;

DROP FUNCTION IF EXISTS getMetadata(t text);

CREATE FUNCTION getMetadata(t text) RETURNS jsonb AS $$

	if (!t) {
		return null;
	}

	var numbers = [
		'height',
		'width',
		'thumbnail_height',
		'thumbnail_width'
	];

	var parts = t.match(/\[!\[([^\]]+)+\]\(([^\)]+)\)\]\(([^\)]+)\)/);
	if (parts && parts.length) {

		var title = parts[1];
		var thumbnailUrlParts = parts[2].split('#');
		var originalUrl = parts[3];

		var metadata = {
			type: 'photo',
			url: originalUrl,
			thumbnail_url: thumbnailUrlParts[0].trim(),
			title: title
		};

		var data = thumbnailUrlParts[1];

		if (data) {
			var pairs = data.split('&');
			var i = 0;
			var l = pairs.length;
			for (i, l; i < l; i++) {
				var kv = pairs[i].split('=');
				metadata[kv[0]] = numbers.indexOf(kv[0]) > -1 ? parseInt(kv[1], 10) : kv[1];
			}
		}

		return JSON.stringify({ photo: metadata });
		}
		else {
			return null;
		}
$$ LANGUAGE plv8 IMMUTABLE;



\echo 'table for updating identities in rooms.'
DROP TABLE IF EXISTS place_map;

CREATE TABLE place_map (
	room_id text,
	room_name text,
	place_id text,
	room_type integer
);

\copy place_map(room_id, room_name, place_id, room_type) from './location.csv' CSV HEADER delimiter ','

-- UPDATE rooms SET identities = ARRAY((SELECT 'place:' || placeid FROM placeid_map WHERE room_name = rooms.name))::text[];


\echo 'Connecting to pure'
\c aravind aravind localhost
--\c pure localhost

--Drop and create tables

\i ./1.sql
\i ./dblink.sql

--Migration data sql queries
\echo 'Executing Rooms migration query'
INSERT
	INTO rooms(
		id,
		name,
		body,
		parents,
		tags,
		createtime,
		creator,
		deletetime,
		meta,
		params,
		terms,
		updater,
		updatetime,
		counts,
		identities)
	SELECT *
	FROM dblink ('SELECT '
			'(SELECT newid FROM id_map WHERE oldid = entities.id) AS id, '
			'room_name AS name, '
			'description AS body, '
			'NULL AS parents, '
			'ARRAY[room_type] AS tags, '
			'ROUND(EXTRACT(EPOCH FROM current_timestamp)*1000) AS createtime, '
			'NULL AS creator, '
			'ROUND(EXTRACT(EPOCH FROM deletetime)*1000) AS deletetime, '
			'json_build_object(''picture'', picture) AS meta, '
			'(SELECT '
				'json_object_agg(name, value) '
				'FROM jsonb_each(params) '
				'AS fields (name, value) '
				'WHERE name <> ''places'''
			') AS params, '
			'terms AS terms, '
			'NULL AS updater, '
			'ROUND(EXTRACT(EPOCH FROM current_timestamp)*1000) AS updatetime, '
			'NULL AS counts, '
			'place_ids AS identities '
		'FROM entities LEFT OUTER JOIN ('
			'SELECT room_id,
			min(room_name) as room_name,
			min(room_type) as room_type,
			array_agg(''place:'' || place_id) as place_ids
			FROM place_map
			GROUP BY room_id'
		') places ON entities.id = places.room_id '
		'WHERE type=''room''')
	AS t(
		id uuid,
		name text,
		body text,
		parents uuid[],
		tags smallint[],
		createtime bigint,
		creator text,
		deletetime bigint,
		meta jsonb,
		params jsonb,
		terms tsvector,
		updater text,
		updatetime bigint,
		counts jsonb,
		identities text[]);


--Users migration query
\echo 'Executing Users migration query'

INSERT
	INTO users(
		id,
		name,
		identities,
		createtime,
		deletetime,
		tags,
		locale,
		counts,
		meta,
		params,
		presence,
		presencetime,
		processid,
		resources,
		timezone,
		updatetime)
	SELECT *
	FROM dblink ('SELECT '
			'id AS id, '
			'guides->>''displayName'' AS name, '
			'(SELECT array_agg(identity) FROM unnest(identities) AS identity WHERE identity like ''mailto:%'') AS identities, '
			'ROUND(EXTRACT(EPOCH FROM createtime)*1000) AS createtime, '
			'ROUND(EXTRACT(EPOCH FROM deletetime)*1000) AS deletetime, '
			'''{4}'' AS tags, '
			'0::smallint AS locale, '
			'NULL AS counts, '
			'json_build_object(''picture'', picture) AS meta, '
			'(SELECT '
				'json_object_agg(name, value) '
				'FROM jsonb_each(params) '
				'AS fields (name, value) '
				'WHERE name <> ''places'''
			') AS params, '
			'NULL AS presence, '
			'NULL AS presencetime, '
			'NULL AS processid, '
			'NULL AS resources, '
			'timezone AS timezone ,'
			'NULL AS updatetime '
		'FROM entities WHERE type=''user''')
	AS t(
		id text,
		name text,
		identities text[],
		createtime bigint,
		deletetime bigint,
		tags smallint[],
		locale smallint,
		counts jsonb,
		meta jsonb,
		params jsonb,
		presence smallint,
		presencetime bigint,
		processid smallint,
		resources jsonb,
		timezone smallint,
		updatetime bigint );


	--Threads migration query
	\echo 'Executing Threads migration query'

	INSERT
		INTO threads(
			id,
			name,
			body,
			parents,
			tags,
			createtime,
			creator,
			deletetime,
			meta,
			params,
			terms,
			updater,
			updatetime,
			counts,
			score)
		SELECT *
		FROM dblink ('SELECT '
				'(SELECT newid FROM id_map WHERE oldid = id) AS id, '
				'title AS name, '
				'(SELECT text FROM texts WHERE id = threads.id) AS body, '
				'ARRAY[(SELECT newid FROM id_map WHERE oldid="to")]::uuid[] AS parents, '
				'(SELECT array_agg( '
					'CASE '
						'WHEN tag = ''hidden'' THEN -1 '
						'WHEN tag = ''image'' THEN 3 '
						'ELSE NULL '
					'END '
				') FROM unnest(tags) tag) AS tags, '
				'round(EXTRACT(EPOCH FROM starttime)*1000) AS createtime, '
				'"from" AS creator, '
				'NULL AS deletetime, '
				'getMetadata((SELECT text FROM texts WHERE id = threads.id)) AS meta, '
				'NULL AS params, '
				'terms AS terms, '
				'updater AS updater, '
				'round(EXTRACT(EPOCH FROM updatetime)*1000) AS updatetime, '
				'json_build_object(''children'', threads.length - 1) AS counts, '
				'NULL AS score '
			'FROM threads')
		AS t(
			id uuid,
			name text,
			body text,
			parents uuid[],
			tags smallint[],
			createtime bigint,
			creator text,
			deletetime bigint,
			meta jsonb,
			params jsonb,
			terms tsvector,
			updater text,
			updatetime bigint,
			counts jsonb,
			score real);


--Texts migration query
\echo 'Executing Texts migration query'
INSERT
	INTO texts(
		id,
		name,
		body,
		parents,
		tags,
		createtime,
		creator,
		deletetime,
		meta,
		params,
		terms,
		updater,
		updatetime,
		counts)
	SELECT *
	FROM dblink ('SELECT '
			'gen_random_uuid() AS id, '
			'title AS name, '
			'CASE '
				'WHEN tags @> ''{image}'' '
					'THEN ('
						'SELECT m[1] '
						'FROM regexp_matches(text, ''\[!\[[^\]]+]\([^)]+\)]\(([^)]+)'') '
						'AS r(m) LIMIT 1) '
				'ELSE text '
			'END AS body, '
			'ARRAY[(SELECT newid FROM id_map WHERE oldid = "thread"), '
				'(SELECT newid FROM id_map WHERE oldid = "to")]::uuid[] AS parents, '
			'(SELECT array_agg( '
				'CASE '
					'WHEN tag = ''hidden'' THEN -1 '
					'WHEN tag = ''image'' THEN 3 '
					'ELSE NULL '
				'END '
			') FROM unnest(tags) tag) AS tags, '
			'ROUND(EXTRACT(EPOCH FROM "time")*1000) AS createtime, '
			'"from" AS creator, '
			'NULL AS deletetime, '
			'getMetadata(text) AS meta, '
			'NULL AS params, '
			'NULL AS terms, '
			'updater AS updater, '
			'ROUND(EXTRACT(EPOCH FROM updatetime)*1000) AS updatetime, '
			'NULL AS counts '
		'FROM texts '
		'WHERE id <> thread')
	AS t(
		id uuid,
		name text,
		body text,
		parents uuid[],
		tags smallint[],
		createtime bigint,
		creator text,
		deletetime bigint,
		meta jsonb,
		params jsonb,
		terms tsvector,
		updater text,
		updatetime bigint,
		counts jsonb)
	WHERE body IS NOT NULL;
