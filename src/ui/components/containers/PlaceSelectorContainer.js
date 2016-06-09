/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import PlaceSelector from '../views/Account/PlaceSelector';
import { addPlace } from '../../../modules/store/actions';

const mapDispatchToProps = dispatch => ({
	addPlace: (user, type, place) => dispatch(addPlace(user, type, place)),
});

const mapSubscriptionToProps = {
	data: {
		key: 'me',
	},
};

export default flowRight(
	createUserContainer(),
	createContainer(mapSubscriptionToProps, mapDispatchToProps),
)(PlaceSelector);
