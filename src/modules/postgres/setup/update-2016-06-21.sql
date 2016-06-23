INSERT INTO roomrels("user","item","roles","createtime")
SELECT id AS "user", 'a6c02590-7704-41e1-b3ab-6f4b55a94e1c' AS "item",'{3}',floor(extract(epoch from now())*1000)
FROM users;
