/* @flow */

import flowRight from 'lodash/flowRight';
import createPaginatedContainer from '../../../modules/store/createPaginatedContainer';
import createTransformPropsContainer from '../../../modules/store/createTransformPropsContainer';
import PeopleList from '../views/PeopleList/PeopleList';
import {
	ROLE_FOLLOWER,
} from '../../../lib/Constants';

const filterInvalidRels = data => data.filter(result => (
	typeof result.type === 'string' ||
	(result.user && typeof result.user.type !== 'string') &&
	(result.rel && typeof result.rel.type !== 'string')
));

const transformFunction = props => {
	if (props.data) {
		return {
			...props,
			data: filterInvalidRels(props.data),
		};
	}
	return props;
};

const sliceFromProps = ({ thread }) => ({
	type: 'rel',
	link: {
		user: 'user',
	},
	filter: {
		rel: {
			item: thread,
			roles_cts: [ ROLE_FOLLOWER ],
		},
	},
	order: 'presenceTime',
});

export default flowRight(
	createPaginatedContainer(sliceFromProps, 10),
	createTransformPropsContainer(transformFunction),
)(PeopleList);
