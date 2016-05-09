/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowEqual from 'shallowequal';
import FloatingActionButton from './FloatingActionButton';
import Modal from './Modal';
import StartDiscussionContainer from '../containers/StartDiscussionContainer';

type Props = {
	room: string;
	user: string;
	onNavigation: Function;
};

export default class StartDiscussionButton extends Component<void, Props, void> {
	static propTypes = {
		room: PropTypes.string.isRequired,
		user: PropTypes.string.isRequired,
		onNavigation: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	_dismissModal: Function = () => {
		Modal.renderChild(null);
	};

	_handlePress: Function = () => {
		Modal.renderChild(<StartDiscussionContainer {...this.props} dismiss={this._dismissModal} />);
	};

	render() {
		return (
			<FloatingActionButton
				{...this.props}
				icon='create'
				onPress={this._handlePress}
			/>
		);
	}
}
