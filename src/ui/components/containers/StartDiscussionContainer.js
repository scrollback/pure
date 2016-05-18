/* @flow */

import React, { Component, PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import PassUserProp from '../../../modules/store/PassUserProp';
import StartDiscussion from '../views/StartDiscussion';
import { startThread } from '../../../modules/store/actions';

type Props = {
	user: string;
	room: string;
}

type State = {
	thread: ?string
}

class StartDiscussionContainer extends Component<void, Props, State> {
	static propTypes = {
		user: PropTypes.string.isRequired,
		room: PropTypes.string.isRequired,
	};

	state: State = {
		thread: null,
	};

	render() {
		return (
			<Connect
				mapSubscriptionToProps={{
					parents: {
						key: {
							type: 'entity',
							id: this.props.room,
						},
						transform: room => room && room.parents ? room.parents : [],
					},
				}}
				mapActionsToProps={{
					startThread: (store, result, props) => (id, name, body, meta) => {
						const changes = startThread({
							id,
							name,
							body,
							meta,
							parents: [ props.room ],
							creator: props.user,
						});

						store.put(changes);

						// FIXME: This should be simpler
						this.setState({
							thread: Object.keys(changes.entities)[0],
						});
					},
				}}
				passProps={{ ...this.props, thread: this.state.thread }}
				component={StartDiscussion}
			/>
		);
	}
}

export default PassUserProp(StartDiscussionContainer);
