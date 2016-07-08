UPDATE users SET updateTime = createtime where updatetime is null;
UPDATE items SET updateTime = createtime where updatetime is null
UPDATE rels SET updateTime = createtime where updatetime is null

ALTER TABLE users ALTER COLUMN updatetime SET DEFAULT extract(epoch from now())*1000;
ALTER TABLE items ALTER COLUMN updatetime SET DEFAULT extract(epoch from now())*1000;
ALTER TABLE rels ALTER COLUMN updatetime SET DEFAULT extract(epoch from now())*1000;

CREATE INDEX ON threads((parents[1]));
CREATE INDEX ON threads(createtime);
CREATE INDEX ON texts((parents[1]));
CREATE INDEX ON users((params->>'email'));
CREATE INDEX ON roomrels(presencetime);
CREATE INDEX ON roomrels("user");
CREATE INDEX ON roomrels using gin (roles);
CREATE INDEX ON roomrels(item);
