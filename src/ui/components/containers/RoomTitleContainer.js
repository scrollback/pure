/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createTransformPropsContainer from '../../../modules/store/createTransformPropsContainer';
import AppbarTitle from '../views/Appbar/AppbarTitle';

const transformTitle = room => {
	if (room && room.type === 'loading') {
		return 'Loading…';
	} else if (room && room.name) {
		return room.name;
	} else {
		return '…';
	}
};

const transformFunction = props => {
	if (props.data) {
		return {
			...props,
			title: transformTitle(props.data),
		};
	}
	return props;
};

const mapSubscriptionToProps = ({ room }) => ({
	data: {
		key: {
			type: 'entity',
			id: room,
		},
	},
});

export default flowRight(
	createContainer(mapSubscriptionToProps),
	createTransformPropsContainer(transformFunction)
)(AppbarTitle);
