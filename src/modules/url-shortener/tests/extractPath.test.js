import test from 'ava';
import extractPath from '../extractPath';

test('should extract path with http', t => {
	t.is(extractPath('http://bel.ng/somepath'), 'somepath');
});

test('should extract path with https', t => {
	t.is(extractPath('https://bel.ng/somepath'), 'somepath');
});

test('should extract path with query param', t => {
	t.is(extractPath('https://bel.ng/somepath?something=somvalue&more=less&hah'), 'somepath');
});
