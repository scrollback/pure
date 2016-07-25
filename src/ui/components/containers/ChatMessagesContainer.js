/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createPaginatedContainer from '../../../modules/store/createPaginatedContainer';
import createTransformPropsContainer from '../../../modules/store/createTransformPropsContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import ChatMessages from '../views/Chat/ChatMessages';
import {
	TYPE_TEXT,
	TAG_POST_HIDDEN,
	TAG_USER_ADMIN,
} from '../../../lib/Constants';
import type {
	Text,
	TextRel,
	User,
} from '../../../lib/schemaTypes';

type TextData = Array<{ text: Text; textrel: TextRel; type?: 'loading' }>

export const transformTexts = (texts: TextData): any => {
	const data = [];

	for (let l = texts.length - 1, i = l; i >= 0; i--) {
		const { text, textrel, type } = texts[i];
		if (type === 'loading') {
			data.push(texts[i]);
		} else if (text && text.type === TYPE_TEXT) {
			const previousItem = texts[i - 1];
			const previousText = previousItem ? previousItem.text : null;
			data.push({
				text,
				textrel,
				previousText,
				isLast: i === l,
			});
		}
	}

	return data;
};

export const filterHidden = (results: TextData, me: User) => me && me.tags && me.tags.indexOf(TAG_USER_ADMIN) > -1 ? results : results.filter(({ text, type }) => {
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
	} = props;

	if (data && me) {
		return {
			...props,
			data: transformTexts(filterHidden(data, me)),
		};
	}
	return props;
}

function mapSubscriptionToProps({ user }) {
	return {
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
				parents_first: thread,
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
