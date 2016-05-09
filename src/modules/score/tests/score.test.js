import test from 'ava';
import { TYPE_THREAD } from '../../../lib/Constants';
import { bus } from '../../../core-server';

test.cb('should add score on thread update', t => {
	t.plan(1);

	require('../score');

	const time = Date.now();

	bus.emit('change', {
		entities: {
			'df8s-rbf43-sdfbhj34-dnf3': {
				id: 'df8s-rbf43-sdfbhj34-dnf3',
				type: TYPE_THREAD,
				parents: [ 'adjgf7f-dsfh3-dsf43-23r' ],
				body: 'some thread title',
				updateTime: time,
			},
		},
	}, (err, changes) => {
		if (err) {
			t.fail(err);
			return;
		}

		t.deepEqual(changes.entities['df8s-rbf43-sdfbhj34-dnf3'], {
			id: 'df8s-rbf43-sdfbhj34-dnf3',
			type: 3,
			parents: [ 'adjgf7f-dsfh3-dsf43-23r' ],
			body: 'some thread title',
			updateTime: time,
			score: 1,
		});
		t.end();
	});
});
