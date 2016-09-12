/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import ImageChooser from 'react-native-image-chooser';
import Icon from '../Core/Icon';
import AvatarRound from '../Avatar/AvatarRound';
import ProfileAvatarUpload from './ProfileAvatarUpload';
import ImageUploadContainer from '../../containers/ImageUploadContainer';
import Colors from '../../../Colors';
import type { User } from '../../../../lib/schemaTypes';

const {
	StyleSheet,
	View,
	TouchableOpacity,
} = ReactNative;

const styles = StyleSheet.create({
	avatar: {
		margin: 8,
		elevation: 2,
	},

	icon: {
		color: Colors.darkGrey,
	},

	button: {
		position: 'absolute',
		right: 16,
		bottom: 16,
		height: 36,
		width: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: Colors.white,
		elevation: 2,
	},
});

type Props = {
	saveUser: Function;
	currentUser: string;
	user: User;
}

type State = {
	photo: ?{
		uri: string;
		size: number;
		name: string;
		height: number;
		width: number;
	};
}

export default class ProfileAvatar extends Component<void, Props, State> {
	static propTypes = {
		saveUser: PropTypes.func.isRequired,
		currentUser: PropTypes.string.isRequired,
		user: PropTypes.shape({
			id: PropTypes.string,
		}),
	};

	state: State = {
		photo: null,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handleUploadFinish = () => {
		const {
			user,
		} = this.props;

		setTimeout(() => {
			const params = user && user.params ? { ...user.params } : {};
			params.lastPictureUpdateTime = Date.now();
			this.props.saveUser({ ...this.props.user, params });
			this._handleUploadClose();
		}, 500);
	};

	_handleUploadClose = () => {
		this.setState({
			photo: null,
		});
	};

	_handleUploadImage = async () => {
		try {
			this.setState({
				photo: null,
			});

			const photo = await ImageChooser.pickImage();

			this.setState({
				photo,
			});
		} catch (e) {
			// Do nothing
		}
	};

	render() {
		const {
			currentUser,
			user,
		} = this.props;

		return (
			<View {...this.props}>
				{this.state.photo ?
					<ImageUploadContainer
						component={ProfileAvatarUpload}
						photo={this.state.photo}
						onUploadClose={this._handleUploadClose}
						onUploadFinish={this._handleUploadFinish}
						uploadOptions={{
							uploadType: 'avatar',
							generateThumb: true,
						}}
						autoStart
					/> : (
						<AvatarRound
							style={styles.avatar}
							user={user.id}
							size={160}
						/>
					)
				}
				{currentUser === user.id ?
					<TouchableOpacity style={styles.button} onPress={this._handleUploadImage}>
						<Icon
							name='photo-camera'
							size={24}
							style={styles.icon}
						/>
					</TouchableOpacity> :
					null
				}
			</View>
		);
	}
}
