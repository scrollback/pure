/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import ImageChooser from 'react-native-image-chooser';
import AppText from '../Core/AppText';
import AppTextInput from '../Core/AppTextInput';
import GrowingTextInput from '../Core/GrowingTextInput';
import TouchFeedback from '../Core/TouchFeedback';
import Icon from '../Core/Icon';
import AppbarSecondary from '../Appbar/AppbarSecondary';
import AppbarTouchable from '../Appbar/AppbarTouchable';
import AppbarIcon from '../Appbar/AppbarIcon';
import ImageUploadContainer from '../../containers/ImageUploadContainer';
import AvatarRound from '../Avatar/AvatarRound';
import Banner from '../Banner/Banner';
import ImageUploadDiscussion from '../ImageUpload/ImageUploadDiscussion';
import Facebook from '../../../modules/Facebook';
import Colors from '../../../Colors';
import { convertRouteToURL } from '../../../../lib/Route';
import { config } from '../../../../core-client';

const {
	AsyncStorage,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	ToastAndroid,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white,
	},
	scene: {
		paddingHorizontal: 8,
		paddingVertical: 16,
	},
	threadName: {
		fontWeight: 'bold',
		fontSize: 20,
		lineHeight: 30,
	},
	threadSummary: {
		fontSize: 16,
		lineHeight: 24,
		margin: 0,
	},
	icon: {
		color: Colors.fadedBlack,
	},
	disabled: {
		opacity: 0.5,
	},
	userIcon: {
		margin: 12,
	},
	entry: {
		paddingVertical: 4,
		paddingHorizontal: 12,
	},
	uploadButtonIcon: {
		color: Colors.fadedBlack,
		marginHorizontal: 16,
		marginVertical: 14,
	},
	uploadButtonIconActive: {
		color: Colors.info,
	},
	footer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		borderTopColor: Colors.separator,
		borderTopWidth: 1,
	},
	postButton: {
		backgroundColor: Colors.info,
		margin: 6,
		width: 100,
		borderRadius: 3,
	},
	postButtonInner: {
		paddingVertical: 10,
		paddingHorizontal: 16,
	},
	postButtonText: {
		color: Colors.white,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	socialItem: {
		flexDirection: 'row',
		alignItems: 'center',
		margin: 12,
	},
	socialIconContainer: {
		height: 28,
		width: 28,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: Colors.grey,
		borderRadius: 2,
	},
	socialIconContainerSelected: {
		backgroundColor: Colors.facebook,
	},
	socialIcon: {
		fontSize: 28,
		color: Colors.white,
	},
	socialTextContainer: {
		marginHorizontal: 12,
		color: Colors.fadedBlack,
		bottom: -3,
	},
	socialTextSelected: {
		color: Colors.facebook,
		fontWeight: 'bold',
	},
	socialLabel: {
		fontSize: 12,
		lineHeight: 18,
	},
	socialTip: {
		fontSize: 10,
		lineHeight: 15,
		opacity: 0.5,
		fontWeight: 'normal',
	},
});

const FACEBOOK_SHARE_CHECKED_KEY = 'start_discussion_facebook_share_checked';

type Props = {
	user: string;
	room: string;
	thread: string;
	startThread: Function;
	onNavigate: Function;
}

type State = {
	name: string;
	body: string;
	upload: ?{
		id: string;
		result: {
			url: ?string;
			thumbnail: ?string;
		}
	};
	photo: ?{
		uri: string;
		size: number;
		name: string;
		height: number;
		width: number;
	};
	status: 'loading' | null;
	error: ?string;
	shareOnFacebook: boolean;
}

const PERMISSION_PUBLISH_ACTIONS = 'publish_actions';
const PERMISSION_PUBLISH_ERROR = 'ERR_REQUEST_PERMISSION';

export default class StartDiscussion extends Component<void, Props, State> {
	static propTypes = {
		user: PropTypes.string.isRequired,
		room: PropTypes.string.isRequired,
		thread: PropTypes.string,
		startThread: PropTypes.func.isRequired,
		onNavigate: PropTypes.func.isRequired,
	};

	state: State = {
		name: '',
		body: '',
		photo: null,
		upload: null,
		status: null,
		error: null,
		thread: null,
		shareOnFacebook: false,
	};

	componentDidMount() {
		this._setShareCheckbox();
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_getPublishPermissions: Function = async () => {
		try {
			const result = await Facebook.logInWithPublishPermissions([ PERMISSION_PUBLISH_ACTIONS ]);

			if (result.permissions_granted.indexOf(PERMISSION_PUBLISH_ACTIONS) === -1) {
				throw new Error(PERMISSION_PUBLISH_ERROR);
			}

			return result;
		} catch (err) {
			ToastAndroid.show('Failed to get permission to post on Facebook', ToastAndroid.SHORT);
			throw err;
		}
	};

	_isFacebookPermissionGranted: Function = async (): Promise<boolean> => {
		try {
			const token = await Facebook.getCurrentAccessToken();

			return token.permissions_granted.indexOf(PERMISSION_PUBLISH_ACTIONS) > -1;
		} catch (err) {
			return false;
		}
	};

	_requestFacebookPermissions: Function = async () => {
		let requested;

		try {
			const granted = await this._isFacebookPermissionGranted();

			if (!granted) {
				requested = true;
				await this._getPublishPermissions();
			}
		} catch (err) {
			if (requested) {
				throw err;
			} else {
				await this._getPublishPermissions();
			}
		}
	};

	_shareOnFacebook: Function = async content => {
		try {
			const token = await Facebook.getCurrentAccessToken();

			if (token && token.user_id) {
				await Facebook.sendGraphRequest('POST', `/${token.user_id}/feed`, content);
			}

			ToastAndroid.show('Post shared on Facebook', ToastAndroid.SHORT);
		} catch (err) {
			ToastAndroid.show('Failed to share post on Facebook', ToastAndroid.SHORT);
		}
	};

	_handleSharePress: Function = () => {
		global.requestAnimationFrame(async () => {
			let shareOnFacebook = !this.state.shareOnFacebook;

			if (shareOnFacebook) {
				try {
					await this._requestFacebookPermissions();
				} catch (err) {
					shareOnFacebook = false;
				}
			}

			this.setState({
				shareOnFacebook,
			});

			AsyncStorage.setItem(FACEBOOK_SHARE_CHECKED_KEY, JSON.stringify(shareOnFacebook));
		});
	};

	_setShareCheckbox: Function = async (): Promise<any> => {
		let shareOnFacebook;

		try {
			const isEnabled = JSON.parse(await AsyncStorage.getItem(FACEBOOK_SHARE_CHECKED_KEY));

			if (isEnabled) {
				const granted = await this._isFacebookPermissionGranted();

				shareOnFacebook = granted;
			} else {
				shareOnFacebook = false;
			}
		} catch (err) {
			shareOnFacebook = false;
		}

		this.setState({
			shareOnFacebook,
		});
	};

	_handleGoBack = () => {
		this.props.onNavigate({
			type: 'pop',
		});
	};

	_handlePosted: Function = thread => {
		const route = {
			name: 'chat',
			props: {
				thread: thread.id,
				room: this.props.room,
				title: this.state.name,
			},
		};

		if (this.state.shareOnFacebook) {
			this._shareOnFacebook({
				link: config.server.protocol + '//' + config.server.host + convertRouteToURL(route),
			});
		}

		setTimeout(() => {
			this._handleGoBack();
		}, 1000);
	};

	_handleError: Function = message => {
		this.setState({
			error: message,
			status: null,
		});
	};

	_postDiscussion: Function = () => {
		const SHORT_TITLE_MESSAGE = 'Title needs be at least 2 words';
		const LONG_TITLE_MESSAGE = 'Title needs be less than 10 words';
		const NO_TITLE_MESSAGE = 'Enter a title in 2 to 10 words';
		const NO_SUMMARY_MESSAGE = 'Enter a short summary';

		if (!this.state.name) {
			this._handleError(NO_TITLE_MESSAGE);
			return;
		}

		if (!this.state.body && !this.state.upload) {
			this._handleError(NO_SUMMARY_MESSAGE);
			return;
		}

		const words = this.state.name.trim().split(/\s+/);

		if (words.length < 2) {
			this._handleError(SHORT_TITLE_MESSAGE);
			return;
		} else if (words.length > 10) {
			this._handleError(LONG_TITLE_MESSAGE);
			return;
		}

		let meta, id,
			body = this.state.body;

		const { upload, photo } = this.state;

		if (upload && upload.result && photo) {
			const { height, width, name } = photo;
			const { result } = upload;
			const aspectRatio = height / width;

			id = upload.id;
			meta = {
				photo: {
					height,
					width,
					title: name,
					url: result.url,
					thumbnail_height: Math.min(480, width) * aspectRatio,
					thumbnail_width: Math.min(480, width),
					thumbnail_url: result.thumbnail,
					type: 'photo',
				},
			};
			body = body || `${name}: ${result.url}`;
		}

		this.setState({
			status: 'loading',
		}, () => {
			const threadObservable = this.props.startThread({
				id,
				body,
				meta,
				name: this.state.name,
				room: this.props.room,
				user: this.props.user,
			});
			const subscription = threadObservable.subscribe({
				next: (thread) => {
					if (thread) {
						this._handlePosted(thread);
						subscription.unsubscribe();
					}
				},
				error: e => {
					this._handleError(e.message);
					subscription.unsubscribe();
				},
			});
		});
	};

	_handlePress: Function = () => {
		if (this.state.status === 'loading') {
			return;
		}

		this._postDiscussion();
	};

	_handleChangeName: Function = name => {
		this.setState({
			name,
			error: null,
		});
	};

	_handleChangeBody: Function = body => {
		this.setState({
			body,
			error: null,
		});
	};

	_handleUploadImage: Function = async () => {
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

	_handleUploadFinish: Function = upload => {
		this.setState({
			upload,
			error: null,
		});
	};

	_handleUploadClose: Function = () => {
		this.setState({
			photo: null,
			upload: null,
			error: null,
		});
	};

	render() {
		const isLoading = this.state.status === 'loading';
		const isDisabled = !(this.state.name && (this.state.body || this.state.upload) && !isLoading);

		return (
			<View style={styles.container}>
				<AppbarSecondary>
					<AppbarTouchable type='secondary' onPress={this._handleGoBack}>
						<AppbarIcon name='close' style={styles.icon} />
					</AppbarTouchable>

					<AvatarRound
						user={this.props.user}
						style={styles.userIcon}
						size={30}
					/>
				</AppbarSecondary>

				<Banner text={this.state.error} type='error' />

				<ScrollView style={styles.scene} keyboardShouldPersistTaps>
					<AppTextInput
						autoFocus
						value={this.state.name}
						onChangeText={this._handleChangeName}
						placeholder='Write a discussion title'
						autoCapitalize='sentences'
						style={[ styles.threadName, styles.entry ]}
						underlineColorAndroid='transparent'
					/>

					{this.state.photo ?
						<ImageUploadContainer
							component={ImageUploadDiscussion}
							photo={this.state.photo}
							onUploadClose={this._handleUploadClose}
							onUploadFinish={this._handleUploadFinish}
							autoStart
						/> :
						<GrowingTextInput
							numberOfLines={5}
							value={this.state.body}
							onChangeText={this._handleChangeBody}
							placeholder='And a short summary'
							autoCapitalize='sentences'
							inputStyle={[ styles.threadSummary, styles.entry ]}
							underlineColorAndroid='transparent'
						/>
					}

					<TouchableOpacity onPress={this._handleSharePress}>
						<View style={styles.socialItem}>
							<View style={[ styles.socialIconContainer, this.state.shareOnFacebook ? styles.socialIconContainerSelected : null ]}>
								<EvilIcons name='sc-facebook' style={styles.socialIcon} />
							</View>
							<AppText style={[ styles.socialTextContainer, this.state.shareOnFacebook ? styles.socialTextSelected : null ]}>
								<AppText style={styles.socialLabel}>
									{this.state.shareOnFacebook ?
										'This will appear on your timeline\n' :
										'Tap to share this with your friends\n'
									}
								</AppText>
								<AppText style={styles.socialTip}>Tip: Sharing improves your discussion’s reach</AppText>
							</AppText>
						</View>
					</TouchableOpacity>
				</ScrollView>
				<View style={styles.footer}>
					<TouchFeedback
						borderless
						onPress={this._handleUploadImage}
					>
						<View style={styles.uploadButton}>
							<Icon
								name='image'
								style={[ styles.uploadButtonIcon, this.state.photo ? styles.uploadButtonIconActive : null ]}
								size={24}
							/>
						</View>
					</TouchFeedback>
					<View style={[ styles.postButton, isDisabled ? styles.disabled : null ]}>
						{isDisabled ?
							<View style={styles.postButtonInner}>
								<AppText style={styles.postButtonText}>{isLoading ? 'Posting…' : 'Post'}</AppText>
							</View> :
							<TouchFeedback onPress={this._handlePress}>
								<View style={styles.postButtonInner}>
									<AppText style={styles.postButtonText}>Post</AppText>
								</View>
							</TouchFeedback>
						}
					</View>
				</View>
			</View>
		);
	}
}
