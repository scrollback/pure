/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import Icon from '../Core/Icon';
import Loading from '../Core/Loading';
import Colors from '../../../Colors';

const {
	StyleSheet,
	TouchableHighlight,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	iconContainerOuter: {
		height: 56,
		width: 56,
		borderRadius: 32,
		margin: 8,
	},
	iconContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		height: 56,
		width: 56,
		borderRadius: 32,
	},

	idleIconContainer: {
		backgroundColor: Colors.accent,
	},

	closeIconContainer: {
		backgroundColor: Colors.fadedBlack,
	},

	doneIconContainer: {
		backgroundColor: Colors.success,
	},

	errorIconContainer: {
		backgroundColor: Colors.error,
	},

	icon: {
		color: Colors.white,
		margin: 16,
	},

	loading: {
		position: 'absolute',
		left: 10,
		top: 10,
	},
});

type Props = {
	status: string;
	closeIcon: string;
	closeIconStyle?: any;
	doneIcon: string;
	doneIconStyle?: any;
	errorIcon: string;
	errorIconStyle?: any;
	idleIcon: string;
	idleIconStyle?: any;
	style?: any;
}

export default class ImageUploadButton extends Component<void, Props, void> {
	static propTypes = {
		status: PropTypes.string.isRequired,
		closeIcon: PropTypes.string.isRequired,
		closeIconStyle: Icon.propTypes.style,
		doneIcon: PropTypes.string.isRequired,
		doneIconStyle: Icon.propTypes.style,
		errorIcon: PropTypes.string.isRequired,
		errorIconStyle: Icon.propTypes.style,
		idleIcon: PropTypes.string.isRequired,
		idleIconStyle: Icon.propTypes.style,
		style: TouchableHighlight.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		let containerStyle, iconStyle, iconName;

		switch (this.props.status) {
		case 'loading':
			containerStyle = styles.closeIconContainer;
			iconStyle = this.props.closeIconStyle;
			iconName = this.props.closeIcon;
			break;
		case 'finished':
			containerStyle = styles.doneIconContainer;
			iconStyle = this.props.doneIconStyle;
			iconName = this.props.doneIcon;
			break;
		case 'error':
			containerStyle = styles.errorIconContainer;
			iconStyle = this.props.errorIconStyle;
			iconName = this.props.errorIcon;
			break;
		default:
			containerStyle = styles.idleIconContainer;
			iconStyle = this.props.idleIconStyle;
			iconName = this.props.idleIcon;
		}

		return (
			<TouchableHighlight
				{...this.props}
				underlayColor={Colors.underlay}
				style={[ styles.iconContainerOuter, this.props.style ]}
			>
				<View style={[ styles.iconContainer, containerStyle ]}>
					<Icon
						name={iconName}
						style={[ styles.icon, iconStyle ]}
						size={24}
					/>

					{this.props.status === 'loading' ?
						<Loading
							size='large'
							color={Colors.white}
							style={styles.loading}
						/> : null
					}

				</View>
			</TouchableHighlight>
		);
	}
}
