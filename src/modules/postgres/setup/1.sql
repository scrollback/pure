-- psql -U user -h host -d database < /path/to/file.sql

-- entities ids are variable-length byte arrays.
-- For rooms and topics they are human-readable strings encoded with UTF-8.
-- They may contain any unicode character except control whitespace punctuation.
-- For texts and threads they are the colon character (:) followed by 15 random
-- bytes. In JSON they are represented by :<20-char base64>.

DROP TABLE IF EXISTS contacts;

CREATE TABLE contacts (
	referrer text,
	createtime bigint DEFAULT extract(epoch from now())*1000 NOT NULL,
	contact jsonb
);

DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS rels CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS jobs;

CREATE TABLE users (
	id text PRIMARY KEY,
	name text, -- user display name
	identities text[] NOT NULL, -- user-private
	createtime bigint DEFAULT extract(epoch from now())*1000 NOT NULL,
	deletetime bigint,
	tags smallint[] DEFAULT '{}' NOT NULL, -- e.g. admin, manager
	locale smallint,
	counts jsonb DEFAULT '{}',
	meta jsonb,
	params jsonb, -- user-private information
	presence smallint, -- foreground/background/none
	presencetime bigint,
	processid smallint,
	resources jsonb, -- { resourceId: foreground/background }
	timezone smallint,
	updatetime bigint DEFAULT extract(epoch from now())*1000 NOT NULL
);

CREATE TABLE items (
	id uuid PRIMARY KEY,
	name text, -- room display name, thread title
	body text, -- room description, thread start message
	type smallint,
	parents uuid[] DEFAULT '{}' NOT NULL, -- room or thread
	tags smallint[] DEFAULT '{}' NOT NULL, -- e.g. image, hidden, sticky, city, area, spot
	createtime bigint DEFAULT extract(epoch from now())*1000 NOT NULL,
	creator text,
	deletetime bigint,
	meta jsonb, -- guides, image dimensions, counts
	params jsonb,
	terms tsvector,
	updater text,
	updatetime bigint DEFAULT extract(epoch from now())*1000 NOT NULL,
	counts jsonb DEFAULT '{}'
);

CREATE TABLE rooms (
	name text NOT NULL,
	identities text[][],
	params jsonb -- owner-private information
) INHERITS (items);

CREATE TABLE threads (
	body text NOT NULL, -- thread start message
	score double precision -- sort ordering
) INHERITS (items);

CREATE TABLE texts (
	body text NOT NULL, -- message text
	creator text NOT NULL -- message text
) INHERITS (items);

CREATE TABLE topics () INHERITS (items);
CREATE TABLE privs  () INHERITS (items);

CREATE TABLE rels (
	item uuid NOT NULL,
	"user" text NOT NULL,
	roles smallint[], -- mute, upvote, home, work
	createtime bigint DEFAULT extract(epoch from now())*1000 NOT NULL,
	updatetime bigint DEFAULT extract(epoch from now())*1000 NOT NULL,,
	admin text,
	expiretime bigint,
	interest float(24),
	message text,
	presence smallint, -- writing/reading/none
	presencetime bigint,
	processid smallint,
	resources jsonb, -- { resource: writing/reading }
	transitrole smallint,
	transittype smallint,
	type smallint,
	PRIMARY KEY("user","item")
);

CREATE TABLE roomrels   (PRIMARY KEY("user","item")) INHERITS (rels);
CREATE TABLE threadrels (PRIMARY KEY("user","item")) INHERITS (rels);
CREATE TABLE textrels   (PRIMARY KEY("user","item")) INHERITS (rels);
CREATE TABLE topicrels  (PRIMARY KEY("user","item")) INHERITS (rels);
CREATE TABLE privrels   (PRIMARY KEY("user","item")) INHERITS (rels);

CREATE TABLE notes (
	"user" text,
	"group" text NOT NULL, -- e.g. thread in which mentioned, room to which invited
	score float(24) NOT NULL,
	count integer DEFAULT 1 NOT NULL, -- this event in this group id
	data jsonb DEFAULT '{}' NOT NULL, -- information like
	event smallint NOT NULL, -- e.g. mention, invite, request
	createtime bigint DEFAULT extract(epoch from now())*1000 NOT NULL,
	updatetime bigint,
	deletetime bigint
);

CREATE TABLE jobs (
	id smallint,
	lastrun bigint DEFAULT extract(epoch from now())*1000
);

CREATE INDEX ON threads((parents[1]));
CREATE INDEX ON texts((parents[1]));

DROP TABLE IF EXISTS urls;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS feeds;
DROP TABLE IF EXISTS postednews;

CREATE TABLE urls (
	shorturl text PRIMARY KEY,
	longurl text NOT NULL
);

CREATE TABLE articles (
	url text NOT NULL,
	rawjson jsonb NOT NULL,
	terms tsvector NOT NULL
);

CREATE INDEX ON articles USING GIN(terms);

CREATE TABLE feeds (
	url text PRIMARY KEY,
	mtbu float(24) DEFAULT 1 NOT NULL,
	lastrequesttime bigint NOT NULL DEFAULT (extract(epoch from now())*1000 - (8 * 24 * 60 * 60 * 1000)),
	lastupdatetime bigint NOT NULL DEFAULT (extract(epoch from now())*1000 - (8 * 24 * 60 * 60 * 1000))
);

CREATE TABLE postednews (
	title text NOT NULL,
	url text NOT NULL,
	roomid text NOT NULL,
	roomname text NOT NULL,
	createtime bigint NOT NULL
);

INSERT INTO jobs VALUES (1), (2), (3);
CREATE EXTENSION plv8;

INSERT INTO rooms (id, name) VALUES ('e8d0a3b8-6c00-4871-84ad-1078b1265c08', 'Support');
INSERT INTO rooms (id, name) VALUES ('a6c02590-7704-41e1-b3ab-6f4b55a94e1c', 'Open House');

INSERT INTO users(id, name,identities,params,meta) VALUES('belongbot', 'belongbot', '{}','{}','{}');

DROP FUNCTION IF EXISTS jsonop(jsonb, jsonb, jsonb);
DROP FUNCTION IF EXISTS jsonop(jsonb, jsonb);
CREATE FUNCTION jsonop(oa jsonb, ob jsonb) RETURNS jsonb AS $$
	function fn(left, right, doMerge) {

		var opfn;

		function isArray(arr) {
			return Object.prototype.toString.call(arr) === "[object Array]";
		}

		function updater(fn) {
			return function (a, b) {
				return typeof a === "undefined" ? deop(b) : fn(a, b);
			};
		}

		opfn = {
			$delete: function (a) { return; },
			$default: updater(function (a, b) { return a; }),
			$replace: function (a, b) { return deop(b); },

			$add: updater(function (a, b) { return a + b; }),
			$mul: updater(function (a, b) { return a * b; }),
			$min: updater(function (a, b) { return Math.min(a, b); }),
			$max: updater(function (a, b) { return Math.max(a, b); }),
			$mod: updater(function (a, b) { return a % b; }),

			$union: updater(function (a, b) {
				var result = a.slice(0), i = 0, l = b.length;
				for (; i < l; i++) if (a.indexOf(b[i]) === -1) result.push(b[i]);
				return result;
			}),
			$inter: updater(function (a, b) {
				var result = [], i = 0, l = b.length;
				for (; i < l; i++) if (a.indexOf(b[i]) >= 0) result.push(b[i]);
				return result;
			}),
			$remove: updater(function (a, b) {
				var pos = a.indexOf(b);
				if (pos >= 0) return a.slice(0, pos).concat(a.slice(pos + 1));
			}),

			$push: function (a, pos, b) {
				if (typeof a === "undefined") return;
				if (pos === null) return a.concat(deop(b));
				return a.slice(0, pos).concat(deop(b), a.slice(pos));
			},
			$chop: function (a, pos, num) {
				if (typeof a === "undefined") return [];
				if (pos === null) return a.slice(0, a.length + num);
				if (pos < 0) pos = a.length + pos;
				if (num < 0) { pos += num; num = -num; }
				if (pos < 0) { num += pos; pos = 0; }
				return a.slice(0, pos).concat(a.slice(pos + num));
			},

			$merge: updater(function (a, b) {
				var i = 0, l = b.length, r = a.slice(0);
				for (; i < l; i++) if (b[i] !== null) r[i] = jsonop(r[i], b[i]);
				return r;
			}),

			$append: updater(function (a, b) { return a + b; }),

			$and: updater(function (a, b) { return a && b; }),
			$or: updater(function (a, b) { return a || b; }),
			$not: function (a) { return !a; }
		};

		function isOperator(value) {
			return (typeof value === "string" && value[0] === "$");
		}

		function isOperation(value) {
			var i, l;
			if (isOperator(value)) return true;
			if (isArray(value)) {
				for (i = 0, l = value.length; i < l; i++) {
					if (isOperator(value[i])) return true;
				}
			}
			return false;
		}

		function execute(tokens) {
			var stack = [], i = 0, l = tokens.length, j, fn, args;
			for(; i < l; i++) if (isOperator(tokens[i])) {
				fn = opfn[tokens[i]]; args = [];
				if (typeof fn !== "function") throw Error("NoSuchOp " + tokens[i]);
				for (j = 0; j < fn.length; j++) args.unshift(stack.pop());
				stack.push(fn.apply(null, args));
			} else {
				stack.push(tokens[i]);
			}
			if (stack.length !== 1) throw Error("OpRun " + JSON.stringify(tokens));
			return stack[0];
		}

		function merge(left, right) {
			var i, result = {}, res;
			for (i in left) result[i] = left[i];
			for (i in right) {
				res = jsonop(result[i], right[i]);
				if (typeof res === "undefined") {
					delete result[i];
				} else {
					result[i] = res;
				}
			}
			return result;
		}

		function deop(object) {
			var i, j, clone = object, cloned = false, val;

			if (doMerge) return object;
			if (isOperation(object)) return execute([ undefined ].concat(object));
			if (typeof object !== "object" || object === null) return object;

			for (i in object) {
				val = deop(object[i]);
				if (val !== object[i]) {
					if (!cloned) {
						clone = Array.isArray(object) ? [] : {};
						for (j in object) {
							if (j === i) break;
							clone[j] = object[j];
						}
						cloned = true;
					}
				}
				if (cloned) clone[i] = val;
			}

			return clone;
		}

		function jsonop(left, right) {
			if (isOperation(right)) {
				right = isArray(right) ? right : [ right ];
				if (isOperation(left)) {
					left = isArray(left) ? left : [ left ];
					if (doMerge) return left.concat(right);
					return execute([ undefined ].concat(left, right));
				}

				if (doMerge && typeof left === "undefined") return right;
				return execute([ left ].concat(right));
			}

			if (typeof left === "object" && left !== null && !isArray(left)) {
				if (typeof right === "object" && right !== null && !isArray(right)){
					return merge(left, right);
				}
			}

			return typeof right !== "undefined" ? deop(right) : left;
		}

		return jsonop(left, right);
	}
	if (typeof oa !== 'object') oa = JSON.parse(oa);
	if (typeof ob !== 'object') ob = JSON.parse(ob);

	return JSON.stringify(fn(oa, ob));
$$ LANGUAGE plv8 IMMUTABLE;
