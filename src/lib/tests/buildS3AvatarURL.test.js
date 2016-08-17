import test from 'ava';
import buildS3AvatarURL from '../buildS3AvatarURL';

test('should return url when size is given', (t) => {
	t.is(buildS3AvatarURL('subham', 32), 'https://s.bel.ng/a/subham/32.jpg');
});

test('should return url when size is not given', (t) => {
	t.is(buildS3AvatarURL('subham'), 'https://s.bel.ng/a/subham/24.jpg');
});

test('should return url when invalid size is given', (t) => {
	t.is(buildS3AvatarURL('subham', 156835), 'https://s.bel.ng/a/subham/960.jpg');
	t.is(buildS3AvatarURL('subham', 0), 'https://s.bel.ng/a/subham/16.jpg');
	t.is(buildS3AvatarURL('subham', 53), 'https://s.bel.ng/a/subham/64.jpg');
	t.is(buildS3AvatarURL('subham', 31), 'https://s.bel.ng/a/subham/32.jpg');
});
