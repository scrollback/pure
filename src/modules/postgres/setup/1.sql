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
	updatetime bigint
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
	updatetime bigint,
	counts jsonb DEFAULT '{}'
);

CREATE TABLE rooms (
	name text NOT NULL,
	identities text[][],
	params jsonb -- owner-private information
) INHERITS (items);

CREATE TABLE threads (
	body text NOT NULL, -- thread start message
	score float(24) -- sort ordering
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
	updatetime bigint,
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

INSERT INTO jobs VALUES (1), (2), (3);
CREATE EXTENSION plv8;

INSERT INTO rooms (id, name) VALUES ('e8d0a3b8-6c00-4871-84ad-1078b1265c08', 'Support');

DROP FUNCTION IF EXISTS jsonop(jsonb, jsonb,jsonb);
CREATE FUNCTION jsonop(oa jsonb, ob jsonb, oop jsonb) RETURNS jsonb AS $$

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	function j(oa, ob, oop) {
		var el = { _: oa },
		    stack = [{ a: el, b: { _: ob }, op: { _: oop } }];

		var opfn = {
			keep: function keep(a) {
				return a;
			},
			inc: function inc(a, b, params) {
				return params && params[0] ? (a + b) % params[0] : a + b;
			},
			mul: function mul(a, b, params) {
				return params && params[0] ? a * b % params[0] : a * b;
			},
			min: function min(a, b) {
				return Math.min(a, b);
			},
			max: function max(a, b) {
				return Math.max(a, b);
			},
			mavg: function mavg(a, b, params) {
				return (a * (params[0] - 1) + b) / params[0];
			},
			union: function union(a, b, p) {
				var arr = Array.isArray(b) ? a.concat(b) : a,
				    result = [],
				    map = {},
				    params = p || [];

				arr.forEach(function (e) {
					if (!map[e] && params.indexOf(e) < 0) result.push(e);
					map[e] = true;
				});

				return result;
			},
			inter: function inter(a, b, params) {
				var map = {};

				for (var _iterator = b, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
					var _ref;

					if (_isArray) {
						if (_i >= _iterator.length) break;
						_ref = _iterator[_i++];
					} else {
						_i = _iterator.next();
						if (_i.done) break;
						_ref = _i.value;
					}

					var _i2 = _ref;
					if (_i2 in a) {
						map[_i2] = true;
					}
				}
				if (params) for (var i in params) {
					map[i] = true;
				}

				return Object.keys(map);
			},
			splice: function splice(a, b, params) {
				if (!params || !params.length) {
					return a.concat(b);
				}

				if (params.length >= 4) {
					return a.slice(params[2] === null ? Infinity : params[2], params[3] === null ? Infinity : params[3]);
				}

				if (params.length >= 2) {
					return a.splice.apply(a, [params[0] === null ? Infinity : params[0], params[1]].concat(b));
				}

				return a;
			},
			replace: function replace(a, b) {
				return b;
			},
			append: function append(a, b, params) {
				return a + (params[0] || "") + b;
			},
			band: function band(a, b) {
				return a & b;
			},
			bor: function bor(a, b) {
				return a | b;
			},
			bxor: function bxor(a, b) {
				return a ^ b;
			},
			and: function and(a, b) {
				return a && b;
			},
			or: function or(a, b) {
				return a || b;
			},
			not: function not(a) {
				return !a;
			}
			// delete and merge are handled separately below
		};

		function deleteOps(obj) {
			var stack = [obj];

			do {
				var o = stack.pop();

				delete stack.__op__;
				for (var i in o) {
					if (_typeof(o[i]) === "object" && o[i] !== null) {
						stack.push(o[i]);
					}
				}
			} while (stack.length);
			return obj;
		}

		function isOp(op) {
			return typeof op === "string" || Array.isArray(op);
		}

		function opval(a, b, i, op, stack) {
			if (op === "delete" || op && op[0] === "delete") {
				delete a[i];
			} else if (typeof a[i] !== "undefined" && op && isOp(op) && op !== "merge" && op[0] !== "merge") {
				if (Array.isArray(op)) {
					a[i] = deleteOps(opfn[op[0]](a[i], b[i], op.slice(1)));
				} else {
					a[i] = deleteOps(opfn[op](a[i], b[i]));
				}
			} else if (Array.isArray(b[i]) && Array.isArray(a[i]) && (op === "merge" || op && op[0] === "merge")) {
				stack.push({ a: a[i], b: b[i] });
			} else if (Array.isArray(b) && b[i] === null) {
				// While merging arrays, skip nulls
			} else if (_typeof(b[i]) === "object" && _typeof(a[i]) === "object" && b[i] !== null && a[i] !== null && !Array.isArray(a[i]) && !Array.isArray(b[i])) {
					stack.push({ a: a[i], b: b[i], op: op });
				} else {
					a[i] = b[i];
				}
		}

		var count = 0;
		do {
			var frame = stack.pop(),
			    a = frame.a,
			    b = frame.b;
			var op = void 0,
			    map = void 0;

			count++;
			if (count > 1000) {
				throw Error('Cycle?');
			}
			if (frame.op && b.__op__) {
				op = j(frame.op, b.__op__);
			} else {
				op = b.__op__ || frame.op;
			}

			map = op ? {} : b;

			if (op) {
				for (var i in b) {
					if (i !== "__op__") {
						map[i] = true;
					}
				}

				if (op.__all__) {
					for (var _i3 in a) {
						map[_i3] = true;
					}
				} else {
					for (var _i4 in op) {
						map[_i4] = true;
					}
				}
			}

			for (var _i5 in map) {
				opval(a, b, _i5, b[_i5] && isOp(b[_i5].__op__) ? b[_i5].__op__ : op && (op[_i5] || op.__all__), stack);
			}
		} while (stack.length);

		return el._;
	}

	if (typeof oa !== 'object') oa = JSON.parse(oa);
	if (typeof ob !== 'object') ob = JSON.parse(ob);
	if (typeof oop !== 'object') oop = JSON.parse(oop);

	return JSON.stringify(j(oa, ob, oop));
$$ LANGUAGE plv8 IMMUTABLE;
