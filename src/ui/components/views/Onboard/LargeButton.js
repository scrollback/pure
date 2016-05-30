/* @flow */

import React, { Component, PropTypes } from 'react';
import Radium from 'radium';
import shallowCompare from 'react-addons-shallow-compare';
import TouchFeedback from '../Core/TouchFeedback';
import Loading from '../Core/Loading';
import Colors from '../../../Colors';

const styles = {
	container: {
		marginTop: 16,
		marginBottom: 16,
	},
	loader: {
		height: 21,
		width: 21,
		marginHorizontal: 16,
	},
	button: {
		display: 'flex',
		backgroundColor: Colors.info,
		padding: 12,
		borderRadius: 3,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonText: {
		color: Colors.white,
		textAlign: 'center',
		paddingHorizontal: 4,
	},
};

type Props = {
	label: string;
	onPress: Function;
	spinner?: boolean;
	disabled?: boolean;
	style?: any;
}

class LargeButton extends Component<void, Props, void> {
	static propTypes = {
		label: PropTypes.string.isRequired,
		onPress: PropTypes.func.isRequired,
		spinner: PropTypes.bool,
		disabled: PropTypes.bool,
		style: PropTypes.any,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		return (
			<div style={styles.container}>
				<TouchFeedback onPress={this.props.disabled ? null : this.props.onPress}>
					<div style={[ styles.button, this.props.style ]}>
						{this.props.spinner ? <Loading style={styles.loader} /> : null}

						<div style={styles.buttonText}>{this.props.label.toUpperCase()}</div>
					</div>
				</TouchFeedback>
			</div>
		);
	}
}

export default Radium(LargeButton);
