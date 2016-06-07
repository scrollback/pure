/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createPaginatedContainer from '../../../modules/store/createPaginatedContainer';
import createTransformPropsContainer from '../../../modules/store/createTransformPropsContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import ChatMessages from '../views/Chat/ChatMessages';
import {
	TYPE_TEXT,
	TYPE_THREAD,
	TAG_POST_HIDDEN,
	TAG_USER_ADMIN,
} from '../../../lib/Constants';

const transformTexts = (texts, thread, threadrel) => {
	const data = [];

	for (let l = texts.length - 1, i = l; i >= 0; i--) {
		const { text, textrel, type } = texts[i];
		if (type === 'loading') {
			data.push(texts[i]);
		} else if (text && text.type === TYPE_TEXT) {
			const previousText = texts[i - 1];
			data.push({
				text,
				textrel,
				previousText,
				isLast: i === l,
			});
		}
	}

	if (thread && thread.type === TYPE_THREAD) {
		const first = data[data.length - 1];

		if (first && first.text && first.text.type === TYPE_TEXT) {
			data[data.length - 1] = {
				text: first.text,
				textrel: first.textrel,
				previousText: thread,
				isLast: false,
			};
		}

		data.push({
			text: thread,
			textrel: threadrel,
		});
	}

	return data;
};

const filterHidden = (results, me) => me && me.tags && me.tags.indexOf(TAG_USER_ADMIN) > -1 ? results : results.filter(({ text, type }) => {
	if (text && text.type === TYPE_TEXT) {
		const isHidden = me.id !== text.creator && (text.tags && text.tags.indexOf(TAG_POST_HIDDEN) > -1);
		return !isHidden;
	}
	return type === 'loading';
});

function transformFunction(props) {
	const {
		data,
		me,
		thread,
		threadrel,
	} = props;

	if (data && me && thread) {
		return {
			...props,
			data: transformTexts(filterHidden(data, me), thread, threadrel),
		};
	}
	return props;
}

function mapSubscriptionToProps({ user, thread }) {
	return {
		thread: {
			key: {
				type: 'entity',
				id: thread,
			},
		},
		threadrel: {
			key: {
				type: 'entity',
				id: `${user}_${thread}`,
			},
		},
		me: {
			key: {
				type: 'entity',
				id: user,
			},
		},
	};
}

function sliceFromProps({ user, thread }) {
	return {
		type: 'text',
		join: {
			textrel: 'item',
		},
		filter: {
			text: {
				parents_cts: [ thread ],
			},
			textrel: {
				user,
			},
		},
		order: 'createTime',
	};
}

export default flowRight(
	createUserContainer(),
	createPaginatedContainer(sliceFromProps, 20),
	createContainer(mapSubscriptionToProps),
	createTransformPropsContainer(transformFunction),
)(ChatMessages);
