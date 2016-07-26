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

const mapSubscriptionToProps = {
	user: {
		key: 'me',
	},
	data: {
		key: {
			type: 'state',
			path: 'ctahome',
		},
	},
};

export default createContainer(mapSubscriptionToProps, mapDispatchToProps)(CTACard);
