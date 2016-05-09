import test from 'ava';
import { isEmoji, format } from '../Smiley';

test('should identify emoji', t => {
	t.true(isEmoji('🍺'));
	t.true(isEmoji('😂'));
	t.true(isEmoji('😀'));
	t.true(isEmoji('🎯'));
	t.true(isEmoji('🔎'));
});

test('should format text with emoji', t => {
	t.is(
		format(
			'This a story about <3 and </3 with emojis. Once there was a 8) boy who used to use lots of :o) emojis. He was (:. One day, the >:-) came to him. He was :o. The devil was actually an 0:-) in disguise.'
		),
		'This a story about 💕 and 💔 with emojis. Once there was a 😎 boy who used to use lots of 🐵 emojis. He was (:. One day, the 😈 came to him. He was :o. The devil was actually an 😇 in disguise.'
	);
});
