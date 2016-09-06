/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import ImageUploadButton from '../ImageUpload/ImageUploadButton';
import Colors from '../../../Colors';

const {
	StyleSheet,
	View,
	Image,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		margin: 8,
		elevation: 2,
		borderRadius: 80,
	},

	avatar: {
		height: 160,
		width: 160,
		borderRadius: 80,
	},

	button: {
		position: 'absolute',
		left: 44,
		top: 44,
	},

	iconIdle: {
		color: Colors.white,
	},

	iconError: {
		marginTop: 14,
		marginBottom: 18,
	},
});

type Props = {
	photo: {
		name: string;
		uri: string;
		height: number;
		width: number;
		size: number;
	};
	status: 'loading' | 'idle' | 'error';
	startUpload: Function;
	cancelUpload: Function;
	closeUpload: Function;
	style?: any;
}

export default class ProfileAvatarUpload extends Component<void, Props, void> {
	static propTypes = {
		photo: PropTypes.shape({
			name: PropTypes.string.isRequired,
			uri: PropTypes.string.isRequired,
			height: PropTypes.number.isRequired,
			width: PropTypes.number.isRequired,
			size: PropTypes.number.isRequired,
		}).isRequired,
		status: PropTypes.string.isRequired,
		startUpload: PropTypes.func.isRequired,
		cancelUpload: PropTypes.func.isRequired,
		closeUpload: PropTypes.func.isRequired,
		style: View.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handleClose = () => {
		this.props.closeUpload();
	};

	_handlePress = () => {
		switch (this.props.status) {
		case 'idle':
		case 'error':
			this.props.startUpload();
			break;
		case 'loading':
			this.props.cancelUpload();
			break;
		}
	};

	render() {
		const {
			uri,
		} = this.props.photo;

		return (
			<View style={styles.container}>
				<Image source={{ uri }} style={styles.avatar} />
				<ImageUploadButton
					onPress={this._handlePress}
					status={this.props.status}
					idleIcon='file-upload'
					closeIcon='close'
					doneIcon='done'
					errorIcon='warning'
					idleIconStyle={styles.iconIdle}
					errorIconStyle={styles.iconError}
					style={styles.button}
				/>
			</View>
		);
	}
}
