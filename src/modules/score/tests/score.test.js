import test from 'ava';
import { TYPE_THREAD } from '../../../lib/Constants';
import { getScore } from '../score';

test('should add score on thread creation', t => {
	const entity = {
		id: 'df8s-rbf43-sdfbhj34-dnf3',
		type: TYPE_THREAD,
		parents: [ 'adjgf7f-dsfh3-dsf43-23r' ],
		body: 'some thread title',
		updateTime: 1464873047099,
		createTime: 1464873047099,
		creator: 'testinguser'
	};
	const score = getScore(entity);
	t.is(score, 24788.411831666665);
});

test('should add score on thread update', t => {
	const entity = {
		id: 'df8s-rbf43-sdfbhj34-dnf3',
		type: TYPE_THREAD,
		counts: {
			children: 12,
			follower: 4,
			upvotes: 2
		}
	};
	const score = getScore(entity);

	t.is(score, 8.170849365732973);
});
