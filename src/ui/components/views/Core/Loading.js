/* @flow */

import React, { Component, PropTypes } from 'react';
import Radium from 'radium';
import shallowCompare from 'react-addons-shallow-compare';
import Colors from '../../../Colors';

const offset = 187;
const duration = '1.4s';

const rotator = Radium.keyframes({
	'0%': { transform: 'rotate(0deg)' },
	'100%': { transform: 'rotate(270deg)' },
}, 'rotator');

const dash = Radium.keyframes({
	'0%': { strokeDashoffset: offset },
	'50%': {
		strokeDashoffset: offset / 4,
		transform: 'rotate(135deg)',
	},
	'100%': {
		strokeDashoffset: offset,
		transform: 'rotate(450deg)',
	},
}, 'dash');

const styles = {
	spinner: {
		height: 24,
		width: 24,
		animation: `x ${duration} linear infinite`,
		animationName: rotator,
	},
	path: {
		stroke: Colors.accent,
		strokeDasharray: offset,
		strokeDashoffset: 0,
		transformOrigin: 'center',
		animation: `x ${duration} ease-in-out infinite`,
		animationName: dash,
	},
};

type Props = {
	style?: any;
	color?: string;
}

class Loading extends Component<void, Props, void> {
	static propTypes = {
		style: PropTypes.any,
		color: PropTypes.string,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		return (
			<svg
				style={[ styles.spinner, this.props.style ]}
				viewBox='0 0 64 64'
				xmlns='http://www.w3.org/2000/svg'
			>
				<circle
					style={[ styles.path, this.props.color ? { stroke: this.props.color } : null ]}
					fill='none'
					stroke-width='8'
					stroke-linecap='round'
					cx='32'
					cy='32'
					r='28'
				>
				</circle>
			</svg>
		);
	}
}

export default Radium(Loading);
