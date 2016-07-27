/* @flow */

import createContainer from '../../../modules/store/createContainer';
import Account from '../views/Account/Account';
import { saveUser } from '../../../modules/store/actions';

const mapDispatchToProps = dispatch => ({
	saveUser: user => dispatch(saveUser(user)),
	signOut: () => dispatch({ type: 'SIGNOUT' }),
});

const mapSubscriptionToProps = {
	user: {
		key: 'me',
	},
};

export default createContainer(mapSubscriptionToProps, mapDispatchToProps)(Account);
