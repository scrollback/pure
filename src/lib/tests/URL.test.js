import test from 'ava';
import {
	isValidURL,
	isValidMail,
	isValidTel,
	buildLink,
	parseURLs,
} from '../URL';

test('should detect valid URLs', t => {
	t.true(isValidURL('goo.gl'));
	t.true(isValidURL('goo.gl/fb/QiUth'));
	t.true(isValidURL('crazylink.mad#totes'));
	t.true(isValidURL('feeds.feedburner.com/~r/funsurf/blog/~3/Nlm78LwLFeI/turn-your-windows-pc-into-wi-fi-hotspot.html?utm_source=feedburner&utm_medium=twitter&utm_campaign=satya164'));
	t.true(isValidURL('www.google.com'));
	t.true(isValidURL('google.com'));
	t.true(isValidURL('google.co.in/'));
	t.true(isValidURL('google.co.in/?q=crazy+long+urls'));
	t.true(isValidURL('http://google.com'));
	t.true(isValidURL('https://www.google.co.in'));
	t.true(isValidURL('https://www.facebook.com/photo.php?fbid=1048881011810753&set=a.148270845205112.32456.100000665916861&type=3&theater'));
	t.true(isValidURL('https://www.amazon.in/b/ref=br_imp?_encoding=UTF8&node=10858436031&pf_rd_m=A1VBAL9TL5WCBF&pf_rd_s=desktop-hero-kindle-A&pf_rd_r=ESDZAWAYGCXGE4SFR739&pf_rd_t=36701&pf_rd_p=1038551147&pf_rd_i=desktop'));
	t.true(isValidURL('74.125.200.102'));
	t.true(isValidURL('74.125.200.102:8080'));
	t.true(isValidURL('ftp://74.125.200.102:8080/'));
});

test('should detect valid emails', t => {
	t.true(isValidMail('someguy@somecompany.co'));
	t.true(isValidMail('some.guy@somecompany.co'));
	t.true(isValidMail('some-guy@somecompany.co'));
});

test('should not detect valid emails', t => {
	t.false(isValidMail('someguy@somecompany'));
	t.false(isValidMail('some.guy@somecompany'));
});

test('should detect valid phone numbers', t => {
	t.true(isValidTel('1234567890'));
	t.true(isValidTel('123-456-7890'));
	t.true(isValidTel('(123)456-7890'));
	t.true(isValidTel('(123) 456-7890'));
	t.true(isValidTel('123 456 7890'));
	t.true(isValidTel('123.456.7890'));
	t.true(isValidTel('+91 (123) 456-7890'));
	t.true(isValidTel('+911234567890'));
	t.true(isValidTel('tel:1234567890'));
	t.true(isValidTel('tel:123-456-7890'));
	t.true(isValidTel('tel:(123)456-7890'));
	t.true(isValidTel('tel:(123) 456-7890'));
	t.true(isValidTel('tel:123 456 7890'));
	t.true(isValidTel('tel:123.456.7890'));
	t.true(isValidTel('tel:+91 (123) 456-7890'));
	t.true(isValidTel('tel:+911234567890'));
});

test('should build link if valid link passed', t => {
	t.is(buildLink('google.co.in/'), 'http://google.co.in/');
	t.is(buildLink('http://google.co.in/'), 'http://google.co.in/');
	t.is(buildLink('https://google.co.in/'), 'https://google.co.in/');
	t.is(buildLink('ftp://74.125.200.102:8080/'), 'ftp://74.125.200.102:8080/');
	t.is(buildLink('someguy@somecompany.co'), 'mailto:someguy@somecompany.co');
	t.is(buildLink('mailto:someguy@somecompany.co'), 'mailto:someguy@somecompany.co');
	t.is(buildLink('123-456-7890'), 'tel:123-456-7890');
	t.is(buildLink('tel:123-456-7890'), 'tel:123-456-7890');
});

test('should parse URLs from chunk of text', t => {
	t.deepEqual(parseURLs(`
		Let's put some complex text with serveral links, such as google.co.in.
		And another like https://awesome.inc, with some invalid stuff like http://boo :D
	`), [
		'http://google.co.in',
		'https://awesome.inc',
	]);
});
