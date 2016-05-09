/* @flow */

import React, { Component, PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import PassUserProp from '../../../modules/store/PassUserProp';
import StartDiscussionDone from '../views/StartDiscussionDone';

type Props = {
	thread: ?string
}

class StartDiscussionDoneContainer extends Component<void, Props, void> {
	static propTypes = {
		thread: PropTypes.string,
	};

	render() {
		if (!this.props.thread) {
			return null;
		}

		return (
			<Connect
				mapSubscriptionToProps={{
					thread: {
						key: {
							type: 'entity',
							id: this.props.thread,
						},
					},
				}}
				passProps={this.props}
				component={StartDiscussionDone}
			/>
		);
	}
}

export default PassUserProp(StartDiscussionDoneContainer);
