/* @flow */

import { v4 } from 'node-uuid';
import createContainer from '../../../modules/store/createContainer';
import NavigationRoot from '../views/Navigation/NavigationRoot';

const mapSubscriptionToProps = {
	navigation: {
		type: 'state',
		path: 'navigation',
	},
};

const mapDispatchToProps = dispatch => ({
	onNavigate: (action) => {
		switch (action.type) {
		case 'PUSH_ROUTE':
			dispatch({
				type: action.type,
				payload: { key: v4(), ...action.payload },
			});
			break;
		default:
			dispatch(action);
		}
	},
});

export default createContainer(mapSubscriptionToProps, mapDispatchToProps)(NavigationRoot);
