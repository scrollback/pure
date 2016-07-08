INSERT INTO rooms (id, name,meta, identities,params)
VALUES (
	'a6c02590-7704-41e1-b3ab-6f4b55a94e1c',
	'India',
	'{"photo": {"url": "b/5ee880ed-28d0-42eb-802f-f32a2d60b2c4/image.jpg", "width": 2048, "height": 1366, "attributions": ["<a href=\"https://maps.google.com/maps/contrib/100990859613278056647/photos\">Nicola e Pina Rajasthan</a>"]}}'::jsonb,
	'{place:ChIJkbeSa_BfYzARphNChaFPjNc}',
	'{"placeDetails": {"id": "75782fd959cc6020c07bd2ab8e76dbafab8491d1", "url": "https://maps.google.com/?q=India&ftid=0x30635ff06b92b791:0xd78c4fa1854213a6", "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png", "name": "India", "scope": "GOOGLE", "types": ["country", "political"], "photos": [{"width": 2048, "height": 1366, "photo_reference": "CoQBdwAAAEwpSTAAoBbgpVEbADpDfpNJBZqR2XpAcvgAGZAMG1BTqmPqQLpEFkbeXLQxgMGUeKgknGAEpV3OMp-IgJURbZ9IprnJMX8S1mUlT2NdUyCliW-7h3TbzrukZtiwv1KlfvrSIcE-y8uZJemleEITqwlU3O_OeEsEEUmyrFxAkHQ_EhBtDInVoYnkZVLkox4hxKdnGhQGwhHsrukVAj7CPCQbCtWYKTfoig", "html_attributions": ["<a href=\"https://maps.google.com/maps/contrib/100990859613278056647/photos\">Nicola e Pina Rajasthan</a>"]}], "geometry": {"location": {"lat": 20.593684, "lng": 78.96288}, "viewport": {"northeast": {"lat": 35.5087008, "lng": 97.39556089999999}, "southwest": {"lat": 6.7535158, "lng": 68.1628851}}}, "place_id": "ChIJkbeSa_BfYzARphNChaFPjNc", "reference": "CnRiAAAAQ9N6KQxnkyQnVBN8SdkqAZqZU7VctyO26wsh-wgRxPJE20wXrRYM1YpFwFbXuzbc62p6NdZhYkuSm7bPeaep9zYEBBcf3pgXbcKqrzEyHh0ddPfXSJymSGlAU5iWG2u9xD4J9UCDZiNhcqsDm0LHPBIQ6diIzfQg_fZEtBX5JEHNMxoUHMNc5JNJmao2_3GEXyN7ghrT_nc", "utc_offset": 330, "adr_address": "<span class=\"country-name\">India</span>", "formatted_address": "India"}}'::jsonb
);


INSERT INTO roomrels("user","item","roles","createtime")
SELECT id AS "user", 'a6c02590-7704-41e1-b3ab-6f4b55a94e1c' AS "item",'{3}',floor(extract(epoch from now())*1000)
FROM users;

CREATE TABLE postednews (
	title text NOT NULL,
	url text NOT NULL,
	roomid text NOT NULL,
	roomname text NOT NULL,
	createtime bigint NOT NULL
);
