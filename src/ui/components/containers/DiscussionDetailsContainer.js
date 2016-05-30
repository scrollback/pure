/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import DiscussionDetails from '../views/Discussion/DiscussionDetails';

type Props = {
	thread: string;
}

const DiscussionDetailsContainer = (props: Props) => (
	<Connect
		mapSubscriptionToProps={{
			thread: {
				key: {
					type: 'entity',
					id: props.thread,
				},
			},
		}}
		passProps={props}
		component={DiscussionDetails}
	/>
);

DiscussionDetailsContainer.propTypes = {
	thread: PropTypes.string.isRequired,
};

export default DiscussionDetailsContainer;
