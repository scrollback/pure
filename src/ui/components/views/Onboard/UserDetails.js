/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import NextButton from './NextButton';
import AppTextInput from '../Core/AppTextInput';
import KeyboardSpacer from '../Core/KeyboardSpacer';
import Icon from '../Core/Icon';
import OnboardTitle from './OnboardTitle';
import OnboardParagraph from './OnboardParagraph';
import OnboardError from './OnboardError';
import Colors from '../../../Colors';
import { config } from '../../../../core-client';

const {
	StatusBar,
	View,
	ScrollView,
	Image,
	StyleSheet,
	TouchableOpacity,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white,
	},

	inner: {
		alignItems: 'center',
		justifyContent: 'center',
	},

	avatar: {
		height: 96,
		width: 96,
		borderRadius: 48,
	},

	avatarContainer: {
		margin: 16,
		height: 96,
		width: 96,
		borderRadius: 48,
		backgroundColor: Colors.placeholder,
	},

	inputContainer: {
		width: 200,
		marginHorizontal: 16,
	},

	closeButtonContainer: {
		alignSelf: 'flex-start',
	},

	closeButton: {
		margin: 16,
		color: Colors.fadedBlack,
	},

	input: {
		textAlign: 'center',
	},
});

type Props = {
	canGoForward: boolean;
	cancelSignUp: Function;
	submitUserDetails: Function;
	onChangeField: Function;
	fields: {
		nick: { value: string; error: ?string };
		name: { value: string; error: ?string };
		picture: { value: string; error: void };
	};
};

export default class UserDetails extends Component<void, Props, void> {
	static propTypes = {
		canGoForward: PropTypes.bool.isRequired,
		cancelSignUp: PropTypes.func.isRequired,
		submitUserDetails: PropTypes.func.isRequired,
		onChangeField: PropTypes.func.isRequired,
		fields: PropTypes.objectOf(PropTypes.shape({
			nick: PropTypes.shape({
				value: PropTypes.string,
				error: PropTypes.instanceOf(Error),
			}),
			name: PropTypes.shape({
				value: PropTypes.string,
				error: PropTypes.instanceOf(Error),
			}),
		})).isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handleChangeNick: Function = (nick: string): void => {
		this.props.onChangeField('nick', nick.toLowerCase());
	};

	_handleChangeName: Function = (name: string): void => {
		this.props.onChangeField('name', name);
	};

	render() {
		const { fields } = this.props;
		const {
			nick,
			name,
			picture,
		} = fields;

		let nickColor, nameColor;

		if (nick.error) {
			nickColor = Colors.error;
		} else if (nick.value) {
			nickColor = Colors.placeholder;
		} else {
			nickColor = Colors.info;
		}

		if (name.error) {
			nameColor = Colors.error;
		} else if (name.value) {
			nameColor = Colors.placeholder;
		} else {
			nameColor = Colors.info;
		}

		return (
			<View style={styles.container}>
				<StatusBar backgroundColor={Colors.grey} />
				<ScrollView keyboardShouldPersistTaps contentContainerStyle={[ styles.container, styles.inner ]}>
					<TouchableOpacity style={styles.closeButtonContainer} onPress={this.props.cancelSignUp}>
						<Icon
							name='close'
							size={24}
							style={styles.closeButton}
						/>
					</TouchableOpacity>
					<OnboardTitle>Create an Account!</OnboardTitle>
					<View style={styles.avatarContainer}>
						<Image style={styles.avatar} source={{ uri: picture.value }} />
					</View>
					<OnboardParagraph>What should we call you?</OnboardParagraph>

					<View style={styles.inputContainer}>
						<AppTextInput
							style={styles.input}
							autoCapitalize='none'
							autoCorrect={false}
							maxLength={32}
							placeholder='Username, e.g. barry43'
							underlineColorAndroid={nickColor}
							onChangeText={this._handleChangeNick}
							value={nick.value}
						/>
						<AppTextInput
							style={styles.input}
							autoCapitalize='words'
							placeholder='Fullname, e.g. Barry Allen'
							underlineColorAndroid={nameColor}
							onChangeText={this._handleChangeName}
							value={name.value}
						/>
					</View>

					<OnboardError
						hint={`People on ${config.app_name}! will know you by your username.`}
						message={nick.error || name.error || null}
					/>

					<KeyboardSpacer />
				</ScrollView>
				<NextButton
					label='Sign up'
					disabled={!this.props.canGoForward}
					onPress={this.props.submitUserDetails}
				/>
			</View>
		);
	}
}
