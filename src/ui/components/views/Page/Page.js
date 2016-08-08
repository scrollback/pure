/* @flow */

import React, { PropTypes, Component } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import Radium from 'radium';

const styles = {
	page: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		height: '100%',
		width: '100%',
	},
};

type Props = {
	children?: React.Element<*>;
	style?: any;
}

class Page extends Component<void, Props, void> {
	static propTypes = {
		children: PropTypes.node.isRequired,
		style: PropTypes.any,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		return (
			<div style={[ styles.page, this.props.style ]}>
				{this.props.children}
			</div>
		);
	}
}

export default Radium(Page);
