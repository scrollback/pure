/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import AppText from '../AppText';
import LargeButton from './LargeButton';
import GoogleSignIn from '../../../modules/GoogleSignIn';
import Facebook from '../../../modules/Facebook';
import Colors from '../../../Colors';

global.GoogleSignIn = GoogleSignIn;

const {
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

	_showFailureMessage: Function = () => {
		ToastAndroid.show('Failed to sign in', ToastAndroid.SHORT);
	};

	_onSignInSuccess: Function = (provider: string, auth: Token) => {
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

	_onSignInFailure: Function = (provider: string) => {
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

	_signInWithFacebook: Function = async (): Promise => {
		try {
			const result = await Facebook.logInWithReadPermissions([
				PERMISSION_PUBLIC_PROFILE, PERMISSION_EMAIL,
			]);

			const {
				permissions_granted,
				access_token,
			} = result;

			if (
				permissions_granted.length &&
				permissions_granted.indexOf(PERMISSION_PUBLIC_PROFILE) > -1 &&
				permissions_granted.indexOf(PERMISSION_EMAIL) > -1
			) {

				if (access_token) {
					this._onSignInSuccess(PROVIDER_FACEBOOK, { accessToken: access_token });
				} else {
					this._onSignInFailure(PROVIDER_FACEBOOK);
				}
			} else {
				this._onSignInFailure(PROVIDER_FACEBOOK);
			}
		} catch (e) {
			if (e.code !== 'ERR_SIGNIN_CANCELLED') {
				this._showFailureMessage();
			}

			this._onSignInFailure(PROVIDER_FACEBOOK);
		}
	};

	_signInWithGoogle: Function = async (): Promise => {
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

	_handleFacebookPress: Function = (): void => global.requestAnimationFrame(() => {
		this.setState({
			facebookLoading: true,
		});

		this._signInWithFacebook();
	});

	_handleGooglePress: Function = (): void => global.requestAnimationFrame(() => {
		this.setState({
			googleLoading: true,
		});

		this._signInWithGoogle();
	});

	render() {
		return (
			<View style={styles.container}>
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
