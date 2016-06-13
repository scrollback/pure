CREATE TABLE urls (
	shorturl text PRIMARY KEY,
	longurl text NOT NULL
);

CREATE TABLE articles (
	url text NOT NULL,
	rawjson jsonb NOT NULL,
	terms tsvector NOT NULL
);

CREATE TABLE feeds (
	url text PRIMARY KEY,
	mtbu float(24) DEFAULT 1 NOT NULL,
	lastrequesttime bigint NOT NULL DEFAULT (extract(epoch from now())*1000 - (8 * 24 * 60 * 60 * 1000)),
	lastupdatetime bigint NOT NULL DEFAULT (extract(epoch from now())*1000 - (8 * 24 * 60 * 60 * 1000))
);