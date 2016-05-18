UPDATE users SET identities = '{}' WHERE identities IS NULL;
UPDATE users SET tags = '{}' WHERE tags IS NULL;
UPDATE items SET parents = '{}' WHERE parents IS NULL;
UPDATE rooms SET name = '' WHERE name IS NULL;
UPDATE threads SET name = '' WHERE name IS NULL;
UPDATE threads SET body = '' WHERE body IS NULL;
UPDATE texts SET body = '' WHERE body IS NULL;
UPDATE notes SET count = 1 WHERE count IS NULL;
UPDATE notes SET data = '{}' WHERE data IS NULL;
UPDATE items SET tags = '{}' WHERE tags IS NULL;
UPDATE items SET createtime = extract(epoch from now())*1000 WHERE createtime IS NULL;
UPDATE users SET createtime = extract(epoch from now())*1000 WHERE createtime IS NULL;

ALTER TABLE contacts ALTER COLUMN createtime SET NOT NULL;
ALTER TABLE contacts ALTER COLUMN createtime SET DEFAULT extract(epoch from now())*1000;

ALTER TABLE users ALTER COLUMN identities SET NOT NULL;
ALTER TABLE users ALTER COLUMN createtime SET NOT NULL;
ALTER TABLE users ALTER COLUMN tags SET NOT NULL;
ALTER TABLE users ALTER COLUMN createtime SET DEFAULT extract(epoch from now())*1000;
ALTER TABLE users ALTER COLUMN tags SET DEFAULT '{}';

ALTER TABLE items ALTER COLUMN parents SET NOT NULL;
ALTER TABLE items ALTER COLUMN createtime SET NOT NULL;
ALTER TABLE items ALTER COLUMN tags SET NOT NULL;
ALTER TABLE items ALTER COLUMN parents SET DEFAULT '{}';
ALTER TABLE items ALTER COLUMN createtime SET DEFAULT extract(epoch from now())*1000;
ALTER TABLE items ALTER COLUMN tags SET DEFAULT '{}';

ALTER TABLE rooms ALTER COLUMN name SET NOT NULL;
ALTER TABLE rooms ADD PRIMARY KEY (id);
ALTER TABLE threads ALTER COLUMN name SET NOT NULL;
ALTER TABLE threads ALTER COLUMN body SET NOT NULL;
ALTER TABLE threads ADD PRIMARY KEY (id);
ALTER TABLE texts ADD PRIMARY KEY (id);

ALTER TABLE texts ALTER COLUMN body SET NOT NULL;

ALTER TABLE rels ALTER COLUMN item SET NOT NULL;
ALTER TABLE rels ALTER COLUMN "user" SET NOT NULL;
ALTER TABLE rels ALTER COLUMN createtime SET NOT NULL;
ALTER TABLE rels ALTER COLUMN createtime SET DEFAULT extract(epoch from now())*1000;

ALTER TABLE notes ALTER COLUMN "group" SET NOT NULL;
ALTER TABLE notes ALTER COLUMN score SET NOT NULL;
ALTER TABLE notes ALTER COLUMN count SET NOT NULL;
ALTER TABLE notes ALTER COLUMN data SET NOT NULL;
ALTER TABLE notes ALTER COLUMN event SET NOT NULL;
ALTER TABLE notes ALTER COLUMN createtime SET NOT NULL;
ALTER TABLE notes ALTER COLUMN count SET DEFAULT 1;
ALTER TABLE notes ALTER COLUMN data SET DEFAULT '{}';
ALTER TABLE notes ALTER COLUMN createtime SET DEFAULT extract(epoch from now())*1000;
