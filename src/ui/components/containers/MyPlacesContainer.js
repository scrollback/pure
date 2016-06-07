/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import createTransformPropsContainer from '../../../modules/store/createTransformPropsContainer';
import MyPlaces from '../views/Account/MyPlaces';
import { addPlace, removePlace } from '../../../modules/store/actions';

const transformFunction = (props) => {
	if (props.data) {
		return {
			...props,
			places: props.data.params && props.data.params.places ? props.data.params.places : {},
		};
	}
	return props;
};

const mapDispatchToProps = dispatch => ({
	addPlace: (user, type, place) => dispatch(addPlace(user, type, place)),
	removePlace: (user, type, place) => dispatch(removePlace(user, type, place)),
});

const mapSubscriptionToProps = () => ({
	data: {
		key: 'me',
	},
});

export default flowRight(
	createUserContainer(),
	createContainer(mapSubscriptionToProps, mapDispatchToProps),
	createTransformPropsContainer(transformFunction),
)(MyPlaces);
