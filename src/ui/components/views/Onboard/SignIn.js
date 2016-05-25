/* @flow */

import React, { Component, PropTypes } from 'react';
import Radium from 'radium';
import LargeButton from './LargeButton';
import GoogleSignIn from '../../../modules/GoogleSignIn';
import Facebook from '../../../modules/Facebook';
import Colors from '../../../Colors';

const styles = {
	container: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
		justifyContent: 'center',
		height: '100%',
		width: '100%',
		textAlign: 'center',
		backgroundColor: Colors.primary,
		backgroundImage: `url(${require('../../../../../assets/signin_bg.jpg')})`, // eslint-disable-line import/no-commonjs
		backgroundSize: 'cover',
		backgroundRepeat: 'no-repeat',
	},
	overlay: {
		display: 'flex',
		flexDirection: 'column',
		flex: 1,
		alignItems: 'center',
		backgroundColor: Colors.fadedBlack,
	},
	inner: {
		display: 'flex',
		flexDirection: 'column',
		flex: 1,
		alignItems: 'stretch',
		padding: 32,
		width: '100%',
		maxWidth: 480,
	},
	error: {
		padding: 8,
		backgroundColor: Colors.error,
		color: Colors.white,
		borderTopLeftRadius: 3,
		borderTopRightRadius: 3,
		width: '100%',
		maxWidth: 480 - (32 * 2),
	},
	phantom: {
		visibility: 'hidden',
	},
	image: {
		display: 'block',
		margin: 8,
	},
	logoContainer: {
		display: 'flex',
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
};

const PROVIDER_GOOGLE = 'google';
const PROVIDER_FACEBOOK = 'facebook';
const PERMISSION_PUBLIC_PROFILE = 'public_profile';
const PERMISSION_EMAIL = 'email';

type Token = { accessToken: string; } | { idToken: string; } | { code: string; };

type Props = {
	signIn: (provider: string, token: Token) => void
}

type State = {
	googleLoading: boolean;
	facebookLoading: boolean;
	failureMessage: ?string;
}

class SignIn extends Component<void, Props, State> {
	static propTypes = {
		signIn: PropTypes.func.isRequired,
	};

	state: State = {
		googleLoading: false,
		facebookLoading: false,
		failureMessage: null,
	};

	_setFailureMessage: Function = (message: string) => {
		this.setState({
			failureMessage: message,
		}, () => {
			setTimeout(() => {
				if (this.state.failureMessage === message) {
					this.setState({
						failureMessage: null,
					});
				}
			}, 3000);
		});
	};

	_showFailureMessage: Function = () => {
		this._setFailureMessage('Failed to sign in');
	};

	_onSignInSuccess: Function = (provider: string, auth: Token) => {
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
				code,
			} = result;

			if (code) {
				this._onSignInSuccess(PROVIDER_FACEBOOK, { Code: code });
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

			if (result.code) {
				this._onSignInSuccess(PROVIDER_GOOGLE, { code: result.code });
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
			<div style={styles.container}>
				<div style={styles.overlay}>
					<div style={styles.inner}>
						<div style={styles.logoContainer}>
							<img src={require('../../../../../assets/logo-white.png')} style={styles.image} />
							<img src={require('../../../../../assets/logotype-white.png')} style={styles.image} />
						</div>
						<div style={styles.buttonContainer}>
							<div style={styles.tip}>SIGN IN OR SIGN UP WITH</div>
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
						</div>
					</div>
					<div style={[ styles.error, this.state.failureMessage ? null : styles.phantom ]}>
						{this.state.failureMessage || '&nbsp;'}
					</div>
				</div>
			</div>
		);
	}
}

export default Radium(SignIn);
