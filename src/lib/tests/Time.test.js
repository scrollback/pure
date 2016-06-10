import test from 'ava';
import { formatShort, formatLong } from '../Time';

test('should format short date for now', t => {
	t.is(formatShort(1462728770073, 1462728770073), 'now');
	t.is(formatShort(1462728770080, 1462728770073), 'now');
});

test('should format short date for future', t => {
	t.is(formatShort(1462728830074, 1462728770073), 'recently');
});

test('should format short date for sometime ago', t => {
	t.is(formatShort(1462728770073, 1462728773074), '3s');
	t.is(formatShort(1462728770073, 1462728890074), '2m');
	t.is(formatShort(1462728770073, 1462732370074), '1h');
	t.is(formatShort(1462728770073, 1463074370074), '4d');
	t.is(formatShort(1462728770073, 1466357570074), '6w');
	t.is(formatShort(1462728770073, 34575528770074), '5y');
});

test('should format long date for now', t => {
	t.is(formatLong(1462728770073, 1462728770073), 'Just now');
	t.is(formatLong(1462728770080, 1462728770073), 'Just now');
});

test('should format long date for future', t => {
	t.is(formatLong(1462728830074, 1462728770073), 'Recently');
});

test('should format long date for sometime ago', t => {
	t.is(formatLong(1462728770073, 1462728773074), '3 seconds ago');
	t.is(formatLong(1462728770073, 1462728890074), '2 minutes ago');
	t.is(formatLong(1462728770073, 1462732370074), '1 hour ago');
	t.is(formatLong(1462728770073, 1462815170074), 'Yesterday');
	t.is(formatLong(1462728770073, 1463074370074), 'Sunday');
	t.is(formatLong(1462728770073, 1466357570074), '8 May');
	t.is(formatLong(1462728770073, 34575528770074), '8 May 2016');
});
