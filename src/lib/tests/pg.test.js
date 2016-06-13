/* eslint-disable no-unused-vars */

import * as pg from '../pg';
import test from 'ava';

test('pg cat with conflicts', t => {
	const res = pg.cat([
		{ $: '(&{url}, &{rawjson}, to_tsvector(&{contentForLexemes}))',
    url: 'http://bangalore.citizenmatters.in/articles/what-makes-for-school-fee-hike-in-bangalore',
    rawjson: '{"title":"What makes Bengaluru schools hike their fee?","link":"http://bangalore.citizenmatters.in/articles/what-makes-for-school-fee-hike-in-bangalore","content":"<img src=\\"http://bangalore.citizenmatters.in//uploads/picture/image/12408/small_citizenmatters_school.jpg\\" /><br/><p>While there are examples of schools getting into profiteering mode, there are schools that need to recover the investment. The \'charity\' tag for schools and the unscientific fee structure the government is proposing is not helping solve any problem.</p>","published":"2016-06-09T20:02:28.000Z"}',
    contentForLexemes: 'What makes Bengaluru schools hike their fee? <img src="http://bangalore.citizenmatters.in//uploads/picture/image/12408/small_citizenmatters_school.jpg" /><br/><p>While there are examples of schools getting into profiteering mode, there are schools that need to recover the investment. The \'charity\' tag for schools and the unscientific fee structure the government is proposing is not helping solve any problem.</p>' },
  { $: '(&{url}, &{rawjson}, to_tsvector(&{contentForLexemes}))',
    url: 'http://bangalore.citizenmatters.in/articles/b-khatha-problems-bbmp',
    rawjson: '{"title":"Can Bengaluru ever become Khatha-mukt?","link":"http://bangalore.citizenmatters.in/articles/b-khatha-problems-bbmp","content":"<br/><p>There are instances of BBMP issuing B khatha to flats without valid reasons, thereby harassing the innocent buyer, says Vishwanatha Rao.</p>","published":"2016-06-08T10:32:30.000Z"}',
    contentForLexemes: 'Can Bengaluru ever become Khatha-mukt? <br/><p>There are instances of BBMP issuing B khatha to flats without valid reasons, thereby harassing the innocent buyer, says Vishwanatha Rao.</p>' },
  { $: '(&{url}, &{rawjson}, to_tsvector(&{contentForLexemes}))',
    url: 'http://bangalore.citizenmatters.in/articles/clearing-the-drains-before-the-rains-a-pictorial-how-to-guide',
    rawjson: '{"title":"Clearing the drains before the rains: a pictorial how-to guide!","link":"http://bangalore.citizenmatters.in/articles/clearing-the-drains-before-the-rains-a-pictorial-how-to-guide","content":"<img src=\\"http://bangalore.citizenmatters.in//uploads/picture/image/17209/small_natraj_sit.jpg\\" /><br/><p>A team of citizens cleared rainwater channels and helped rainwater flow into the lake. Here\'s how they did it.</p>","published":"2016-06-08T08:38:21.000Z"}',
    contentForLexemes: 'Clearing the drains before the rains: a pictorial how-to guide! <img src="http://bangalore.citizenmatters.in//uploads/picture/image/17209/small_natraj_sit.jpg" /><br/><p>A team of citizens cleared rainwater channels and helped rainwater flow into the lake. Here\'s how they did it.</p>' },
  { $: '(&{url}, &{rawjson}, to_tsvector(&{contentForLexemes}))',
    url: 'http://bangalore.citizenmatters.in/articles/bmtc-bus-passes-for-school-students-for-2016-17',
    rawjson: '{"title":"BMTC bus passes for school students for 2016-17","link":"http://bangalore.citizenmatters.in/articles/bmtc-bus-passes-for-school-students-for-2016-17","content":"<br/><p>Help students in your neighborhood get BMTC bus passes. Here\'s the information that you need.</p>","published":"2016-06-07T11:14:55.000Z"}',
    contentForLexemes: 'BMTC bus passes for school students for 2016-17 <br/><p>Help students in your neighborhood get BMTC bus passes. Here\'s the information that you need.</p>' },
  { $: '(&{url}, &{rawjson}, to_tsvector(&{contentForLexemes}))',
    url: 'http://bangalore.citizenmatters.in/articles/here-s-where-you-can-get-help-during-rains-in-bengaluru',
    rawjson: '{"title":"Here\'s where you can get help during rains in Bengaluru","link":"http://bangalore.citizenmatters.in/articles/here-s-where-you-can-get-help-during-rains-in-bengaluru","content":"<img src=\\"http://bangalore.citizenmatters.in//uploads/picture/image/17159/small_Sriram_Chirping_Woods_flooding_2.jpg\\" /><br/><p>Monsoon is gaining strength in Bengaluru. Here\'s where you need to get help if your area is flooded/ if rain is affecting life.</p>","published":"2016-06-07T10:37:29.000Z"}',
    contentForLexemes: 'Here\'s where you can get help during rains in Bengaluru <img src="http://bangalore.citizenmatters.in//uploads/picture/image/17159/small_Sriram_Chirping_Woods_flooding_2.jpg" /><br/><p>Monsoon is gaining strength in Bengaluru. Here\'s where you need to get help if your area is flooded/ if rain is affecting life.</p>' },
  { $: '(&{url}, &{rawjson}, to_tsvector(&{contentForLexemes}))',
    url: 'http://bangalore.citizenmatters.in/articles/tracing-the-history-of-nature-in-the-city-of-bengaluru',
    rawjson: '{"title":"Tracing the history of nature in the city of Bengaluru","link":"http://bangalore.citizenmatters.in/articles/tracing-the-history-of-nature-in-the-city-of-bengaluru","content":"<img src=\\"http://bangalore.citizenmatters.in//uploads/picture/image/16824/small_Bellandur_lake_26.JPG\\" /><br/><p>A new book, Nature in the City examines the past, present and future of nature in rapidly urbanising Bengaluru. An excerpt.</p>","published":"2016-06-07T06:34:16.000Z"}',
    contentForLexemes: 'Tracing the history of nature in the city of Bengaluru <img src="http://bangalore.citizenmatters.in//uploads/picture/image/16824/small_Bellandur_lake_26.JPG" /><br/><p>A new book, Nature in the City examines the past, present and future of nature in rapidly urbanising Bengaluru. An excerpt.</p>' }
	]);

	// console.log(res);
});

