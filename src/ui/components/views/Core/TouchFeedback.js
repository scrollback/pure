/* @flow */

import React, { Component, PropTypes } from 'react';
import Radium from 'radium';
import shallowCompare from 'react-addons-shallow-compare';

type Props = {
	onPress?: ?Function;
	borderless?: boolean;
	pressColor?: string;
	children?: React.Element;
	style?: any;
}

const styles = {
	button: {
		position: 'relative',
		cursor: 'pointer',
	},
};

class TouchFeedback extends Component<void, Props, void> {
	static propTypes = {
		onPress: PropTypes.func,
		borderless: PropTypes.bool,
		pressColor: PropTypes.string,
		children: PropTypes.node.isRequired,
		style: PropTypes.any,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		return (
			<div
				{...this.props}
				style={[ styles.button, this.props.style ]}
				onClick={this.props.onPress}
			>
				{this.props.children}
			</div>
		);
	}
}

export default Radium(TouchFeedback);
