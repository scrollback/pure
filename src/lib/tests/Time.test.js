import test from 'ava';
import { short, long } from '../Time';

test('should format short date for now', t => {
	t.is(short(1462728770073, 1462728770073), 'now');
	t.is(short(1462728770080, 1462728770073), 'now');
});

test('should format short date for future', t => {
	t.is(short(1462728830074, 1462728770073), 'future');
});

test('should format short date for sometime ago', t => {
	t.is(short(1462728770073, 1462728773074), '3s');
	t.is(short(1462728770073, 1462728890074), '2m');
	t.is(short(1462728770073, 1462732370074), '1h');
	t.is(short(1462728770073, 1463074370074), '4d');
	t.is(short(1462728770073, 1466357570074), '6w');
	t.is(short(1462728770073, 34575528770074), '5y');
});

test('should format long date for now', t => {
	t.is(long(1462728770073, 1462728770073), 'Just now');
	t.is(long(1462728770080, 1462728770073), 'Just now');
});

test('should format long date for future', t => {
	t.is(long(1462728830074, 1462728770073), 'Future');
});

test('should format long date for sometime ago', t => {
	const date = new Date(1462728770073);
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const time = `${hours > 12 ? (hours + 11) % 12 + 1 : hours}:${minutes > 10 ? minutes : '0' + minutes} ${hours > 12 ? 'pm' : 'am'}`;

	t.is(long(1462728770073, 1462728773074), '3 seconds ago');
	t.is(long(1462728770073, 1462728890074), '2 minutes ago');
	t.is(long(1462728770073, 1462732370074), '1 hour ago');
	t.is(long(1462728770073, 1462815170074), `Yesterday, ${time}`);
	t.is(long(1462728770073, 1463074370074), `Sunday, ${time}`);
	t.is(long(1462728770073, 1466357570074), `8 May, ${time}`);
	t.is(long(1462728770073, 34575528770074), `8 May 2016, ${time}`);
});
