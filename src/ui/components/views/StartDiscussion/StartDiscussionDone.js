/* @flow */

import { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import type { Item } from '../../../../lib/schemaTypes';

type Props = {
	onPosted: Function;
	thread: ?Item;
}

class StartDiscussionDone extends Component<void, Props, void> {
	static propTypes = {
		onPosted: PropTypes.func.isRequired,
		thread: PropTypes.object,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_done: boolean = false;

	render(): null {
		if (this.props.thread && !this._done) {
			this._done = true;
			setTimeout(() => this.props.onPosted(this.props.thread), 0);
		}

		return null;
	}
}

export default StartDiscussionDone;
