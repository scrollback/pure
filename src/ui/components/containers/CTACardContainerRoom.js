/* @flow */

import createContainer from '../../../modules/store/createContainer';
import CTACard from '../views/Card/CTACard';

const mapDispatchToProps = dispatch => ({
	shareContent: (title, text) => {
		dispatch({
			type: 'SHARE_LINK',
			payload: {
				title,
				text,
			},
		});
	},
});

const mapSubscriptionToProps = ({ room }) => ({
	user: {
		key: 'me',
	},
	data: {
		key: {
			type: 'state',
			path: 'ctaroom',
		},
	},
	room: {
		key: {
			type: 'entity',
			id: room,
		},
	},
});

export default createContainer(mapSubscriptionToProps, mapDispatchToProps)(CTACard);
