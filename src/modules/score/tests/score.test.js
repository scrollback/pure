import test from 'ava';
import { TYPE_THREAD } from '../../../lib/Constants';
import getScore from '../score';

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
	t.is(score, 14873047099);
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

	t.is(score, 490250);
});

test('scores with minor changes to create or update time shouldnt be same', t => {
	const s1 = getScore({
		updateTime: 1470778593853,
		createTime: 1470778593853,
		counts: {
			children: 1,
			follower: 1,
			upvote: 1
		}
	});

	const s2 = getScore({
		updateTime: 1470778593854,
		createTime: 1470778593854,
		counts: {
			children: 1,
			follower: 1,
			upvote: 1
		}
	});

	const s3 = getScore({
		updateTime: 1470778593855,
		createTime: 1470778593855,
		counts: {
			children: 1,
			follower: 1,
			upvote: 1
		}
	});

	t.true(s1 !== s2 && s2 !== s3 && s3 !== s1);
});
