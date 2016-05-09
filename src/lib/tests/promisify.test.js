import test from 'ava';
import promisify from '../promisify';

test('should promisify node style API', async t => {
	const doStuff = (arg1, arg2, callback) => {
		if (typeof arg1 === 'number' && typeof arg2 === 'number') {
			callback(null, true);
		} else {
			callback(new Error());
		}
	};
	const doStuffAsync = promisify(doStuff);

	t.true(await doStuffAsync(1, 2));
	t.throws(doStuffAsync(1));
});
