/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import App from '../views/App';

const mapSubscriptionToProps = {
	connection: {
		key: {
			type: 'state',
			path: 'connectionStatus',
		},
	},
	session: {
		key: {
			type: 'state',
			path: 'session',
		},
	},
};

export default flowRight(
	createUserContainer(),
	createContainer(mapSubscriptionToProps),
)(App);
