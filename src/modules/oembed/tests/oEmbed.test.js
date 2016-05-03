import test from 'ava';
import oEmbed from '../oEmbed';

global.fetch = require('node-fetch'); // eslint-disable-line import/no-commonjs
global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest; // eslint-disable-line import/no-commonjs

test('should return oEmbed data for youtube.com', async t => {
	const data = await oEmbed('https://www.youtube.com/watch?v=uVdV-lxRPFo');

	t.is(data.type, 'video');
	t.is(data.title, 'Captain America: Civil War - Trailer World Premiere');
	t.is(data.thumbnail_url, 'https://i.ytimg.com/vi/uVdV-lxRPFo/hqdefault.jpg');
	t.is(data.thumbnail_height, 360);
	t.is(data.thumbnail_width, 480);
});

test('should return opengraph data for on.aol.com', async t => {
	const data = await oEmbed('http://on.aol.com/video/officials-fox-lake-officer-s-death-a-suicide-519216799?context=PC:homepage:PL1944:1446706878971');

	t.is(data.type, 'link');
	t.is(data.title, 'Officials: Fox Lake Officer\'s Death a Suicide');
	t.is(data.thumbnail_url, 'http://feedapi.b2c.on.aol.com/v1.0/app/videos/aolon/519216799/images/470x264.jpg?region=US');
	t.is(data.thumbnail_height, 264);
	t.is(data.thumbnail_width, 470);
});

test('should return meta data for w3schools.com', async t => {
	const data = await oEmbed('http://www.w3schools.com/');

	t.is(data.type, 'link');
	t.is(data.title, 'W3Schools Online Web Tutorials');
});

test('should return image data for image link', async t => {
	const data = await oEmbed('http://1.images.comedycentral.com/images/shows/GetSpooked/getspooked_thumbnail.jpg?width=640&height=360&crop=true');

	t.is(data.type, 'link');
	t.is(data.thumbnail_url, 'http://1.images.comedycentral.com/images/shows/GetSpooked/getspooked_thumbnail.jpg?width=640&height=360&crop=true');
});

test('should return oEmbed data for deccanherald.com', async t => {
	const data = await oEmbed('http://www.deccanherald.com/content/514998/bjp-mps-asked-avoid-making.html');

	t.is(data.type, 'link');
	t.is(data.thumbnail_url, 'http://www.deccanherald.com/page_images/original/2015/12/01/514998.jpg');
	t.is(data.title, 'BJP MPs asked to avoid making provocative statements');
	t.is(data.description, 'BJP MPs were today asked to avoid making provocative statements amid the debate in Parliament over the issue of intolerance where controversial comments by some party leaders, including ministers, have come in handy for the opposition in its attack on the government.');
});

test('should return oEmbed data for storypick.com', async t => {
	const data = await oEmbed('http://www.storypick.com/mark-priscilla-max/');

	t.is(data.type, 'rich');
	t.is(data.thumbnail_url, 'http://www.storypick.com/wp-content/uploads/2015/12/mark-priscilla-cover.jpg');
	t.is(data.title, 'Mark Zuckerberg Just Became Dad Of A Baby Girl, Pledges To Donate 99% Of Facebook Shares.');
});

test('should return oEmbed data 9gag.com', async t => {
	const data = await oEmbed('http://9gag.com/gag/aNK6m3b');

	t.is(data.type, 'link');
	t.is(data.thumbnail_url, 'http://images-cdn.9gag.com/photo/aNK6m3b_700b.jpg');
	t.is(data.title, 'I am a film student. This was a question on my sound recording test.');
	t.is(data.description, 'Click to see the pic and write a comment...');
});

test('should return oEmbed data for timesofindia.indiatimes.com', async t => {
	const data = await oEmbed('http://timesofindia.indiatimes.com/city/chennai/Chennai-Floods-City-reels-even-as-more-rain-predicted-airport-closed-trains-canceled/articleshow/50008799.cms');

	t.is(data.type, 'link');
	t.is(data.thumbnail_url, 'http://timesofindia.indiatimes.com/photo/50009399.cms');
	t.is(data.title, 'Chennai Floods: City reels even as more rain predicted; airport closed, trains canceled - Times of India');
	t.is(data.description, 'Chennai is at a standstill because of floods caused by the worst rains in a 100 years. The airport has been closed and trains canceled. But things could get worse, with the Met Department predicting more rain for northern Tamil Nadu in coming days.');
});

test('should return oEmbed data for collegehumor.com', async t => {
	const data = await oEmbed('http://www.collegehumor.com/post/7034949/what-the-world-looks-like-when-youre-hungry?ref=homepage');

	t.is(data.type, 'link');
	t.is(data.thumbnail_url, 'http://2.media.collegehumor.cvcdn.com/31/46/dfaed81e7bce3deebb492bc6a070e5bd.jpg');
	t.is(data.title, '7 Ways The World Changes When You\'re Hungry');
	t.is(data.description, 'Everything looks a lot more delicious when you\'re hungry.');
});
