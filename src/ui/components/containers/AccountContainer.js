/* @flow */

import createContainer from '../../../modules/store/createContainer';
import Account from '../views/Account/Account';
import { saveUser } from '../../../modules/store/actions';
import { bus } from '../../../core-client';

const mapDispatchToProps = dispatch => ({
	saveUser: user => dispatch(saveUser(user)),
	signOut: () => bus.emit('signout'),
});

const mapSubscriptionToProps = () => ({
	user: {
		key: 'me',
	},
});

export default createContainer(mapSubscriptionToProps, mapDispatchToProps)(Account);
