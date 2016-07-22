/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import { LoginManager, AccessToken } from 'react-native-fbsdk';
import AppText from '../Core/AppText';
import LargeButton from './LargeButton';
import GoogleSignIn from '../../../modules/GoogleSignIn';
import Colors from '../../../Colors';

const {
	StatusBar,
	StyleSheet,
	View,
	ToastAndroid,
	Image,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'stretch',
		backgroundColor: Colors.primary,
	},
	cover: {
		flex: 1,
		width: null,
		height: null,
	},
	overlay: {
		flex: 1,
		alignItems: 'stretch',
		padding: 32,
		backgroundColor: Colors.fadedBlack,
	},
	image: {
		resizeMode: 'contain',
		margin: 8,
	},
	imageLogo: {
		height: 60,
		width: 51,
	},
	imageLogoType: {
		height: 39,
		width: 111,
	},
	logoContainer: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		margin: 16,
		marginLeft: -16,
	},
	tip: {
		color: Colors.white,
		textAlign: 'center',
		paddingHorizontal: 4,
		marginVertical: 8,
	},
	buttonContainer: {
		alignItems: 'stretch',
	},
	facebook: {
		backgroundColor: Colors.facebook,
	},
	google: {
		backgroundColor: Colors.google,
	},
});

const PROVIDER_GOOGLE = 'google';
const PROVIDER_FACEBOOK = 'facebook';
const PERMISSION_PUBLIC_PROFILE = 'public_profile';
const PERMISSION_EMAIL = 'email';

type Token = { accessToken: string; } | { idToken: string; };

type Props = {
	signIn: (provider: string, token: Token) => void
}

type State = {
	googleLoading: boolean;
	facebookLoading: boolean;
}

export default class SignIn extends Component<void, Props, State> {
	static propTypes = {
		signIn: PropTypes.func.isRequired,
	};

	state: State = {
		googleLoading: false,
		facebookLoading: false,
	};

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_showFailureMessage = () => {
		ToastAndroid.show('Failed to sign in', ToastAndroid.SHORT);
	};

	_onSignInSuccess = (provider: string, auth: Token) => {
		switch (provider) {
		case PROVIDER_GOOGLE:
			ToastAndroid.show('Signing in with Google', ToastAndroid.SHORT);
			break;
		case PROVIDER_FACEBOOK:
			ToastAndroid.show('Signing in with Facebook', ToastAndroid.SHORT);
			break;
		}

		this.props.signIn(provider, auth);
	};

	_onSignInFailure = (provider: string) => {
		switch (provider) {
		case PROVIDER_GOOGLE:
			this.setState({
				googleLoading: false,
			});
			break;
		case PROVIDER_FACEBOOK:
			this.setState({
				facebookLoading: false,
			});
			break;
		}
	};

	_signInWithFacebook = async (): Promise => {
		try {
			const result = await LoginManager.logInWithReadPermissions([
				PERMISSION_PUBLIC_PROFILE, PERMISSION_EMAIL,
			]);

			if (result.isCancelled) {
				this._showFailureMessage();
			} else {
				const { grantedPermissions } = result;

				if (
					grantedPermissions && grantedPermissions.length &&
					grantedPermissions.indexOf(PERMISSION_PUBLIC_PROFILE) > -1 &&
					grantedPermissions.indexOf(PERMISSION_EMAIL) > -1
				) {
					const accessToken = await AccessToken.getCurrentAccessToken();

					if (accessToken) {
						this._onSignInSuccess(PROVIDER_FACEBOOK, { accessToken: accessToken.accessToken });
					} else {
						this._onSignInFailure(PROVIDER_FACEBOOK);
					}
				} else {
					this._onSignInFailure(PROVIDER_FACEBOOK);
				}
			}
		} catch (e) {
			this._onSignInFailure(PROVIDER_FACEBOOK);
		}
	};

	_signInWithGoogle = async (): Promise => {
		try {
			const result = await GoogleSignIn.signIn();

			if (result.id_token) {
				this._onSignInSuccess(PROVIDER_GOOGLE, { idToken: result.id_token });
			} else {
				this._onSignInFailure(PROVIDER_GOOGLE);
			}
		} catch (e) {
			if (e.code !== 'ERR_SIGNIN_CANCELLED') {
				this._showFailureMessage();
			}

			this._onSignInFailure(PROVIDER_GOOGLE);
		}
	};

	_handleFacebookPress = (): void => global.requestAnimationFrame(() => {
		this.setState({
			facebookLoading: true,
		});

		this._signInWithFacebook();
	});

	_handleGooglePress = (): void => global.requestAnimationFrame(() => {
		this.setState({
			googleLoading: true,
		});

		this._signInWithGoogle();
	});

	render() {
		return (
			<View style={styles.container}>
				<StatusBar backgroundColor={Colors.black} />
				<Image source={require('../../../../../assets/signin_bg.jpg')} style={styles.cover}>
					<View style={styles.overlay}>
						<View style={styles.logoContainer}>
							<Image source={require('../../../../../assets/logo-white.png')} style={[ styles.image, styles.imageLogo ]} />
							<Image source={require('../../../../../assets/logotype-white.png')} style={[ styles.image, styles.imageLogoType ]} />
						</View>
						<View style={styles.buttonContainer}>
							<AppText style={styles.tip}>SIGN IN OR SIGN UP WITH</AppText>
							<LargeButton
								style={styles.facebook}
								spinner={this.state.facebookLoading}
								disabled={this.state.facebookLoading}
								label={this.state.facebookLoading ? '' : 'Facebook'}
								onPress={this._handleFacebookPress}
							/>
							<LargeButton
								style={styles.google}
								spinner={this.state.googleLoading}
								disabled={this.state.googleLoading}
								label={this.state.googleLoading ? '' : 'Google'}
								onPress={this._handleGooglePress}
							/>
						</View>
					</View>
				</Image>
			</View>
		);
	}
}
