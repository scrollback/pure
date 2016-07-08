/* @flow */

import React, { Component, PropTypes } from 'react';
import debounce from 'lodash/debounce';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from '../Core/AppText';
import Icon from '../Core/Icon';
import PageLoading from '../Page/PageLoading';
import PageEmpty from '../Page/PageEmpty';
import TouchFeedback from '../Core/TouchFeedback';
import AppTextInput from '../Core/AppTextInput';
import ActionSheet from '../Core/ActionSheet';
import ActionSheetItem from '../Core/ActionSheetItem';
import Colors from '../../../Colors';
import GCM from '../../../modules/GCM';
import type { User } from '../../../../lib/schemaTypes';

const {
	StyleSheet,
	ScrollView,
	View,
	PixelRatio,
	Switch,
} = ReactNative;

const styles = StyleSheet.create({
	settings: {
		alignItems: 'stretch',
	},
	section: {
		marginBottom: 8,
		backgroundColor: Colors.white,
		borderColor: Colors.separator,
		borderTopWidth: 1 / PixelRatio.get(),
		borderBottomWidth: 1 / PixelRatio.get(),
	},
	header: {
		fontSize: 12,
		marginHorizontal: 16,
		marginTop: 12,
		marginBottom: 4,
		fontWeight: 'bold',
		color: Colors.grey,
	},
	icon: {
		color: Colors.grey,
		marginVertical: 16,
		marginHorizontal: 8,
	},
	inputContainer: {
		flexDirection: 'row',
		marginHorizontal: 8,
		paddingBottom: 2,
		borderColor: Colors.separator,
		borderBottomWidth: 1 / PixelRatio.get(),
	},
	growing: {
		flex: 1,
	},
	input: {
		paddingVertical: 8,
		marginHorizontal: 8,
	},
	item: {
		flexDirection: 'row',
		alignItems: 'center',
		borderColor: Colors.separator,
		borderBottomWidth: 1 / PixelRatio.get(),
		padding: 16,
	},
	itemLabel: {
		flex: 1,
	},
	itemText: {
		color: Colors.darkGrey,
	},
	itemValueText: {
		fontSize: 12,
	},
});

type Props = {
	user: { type: 'loading' } | User | null;
	saveUser: Function;
	signOut: Function;
	onNavigate: Function;
}

type State = {
	GCMEnabled: boolean;
	frequencySheetVisible: boolean;
}

export default class Account extends Component<void, Props, State> {
	static propTypes = {
		user: PropTypes.oneOfType([
			PropTypes.oneOf([ 'loading' ]),
			PropTypes.shape({
				id: PropTypes.string,
				meta: PropTypes.object,
				params: PropTypes.object,
			}),
		]),
		saveUser: PropTypes.func.isRequired,
		signOut: PropTypes.func.isRequired,
		onNavigate: PropTypes.func.isRequired,
	};

	state: State = {
		GCMEnabled: true,
		frequencySheetVisible: false,
	};

	componentWillMount() {
		this._updateGCMValue();
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handleManagePlaces = () => {
		this.props.onNavigate({
			type: 'push',
			payload: {
				name: 'places',
			},
		});
	}

	_saveUser = debounce(user => this.props.saveUser(user), 1000);

	_updateGCMValue = async (): Promise<void> => {
		let GCMEnabled = true;

		try {
			GCMEnabled = await GCM.isNotificationsEnabled();
		} catch (e) {
			GCMEnabled = false;
		}

		this.setState({
			GCMEnabled,
		});
	};

	_handleMetaItemChange = (key: string, value: string) => {
		const {
			user,
		} = this.props;

		const meta = user && user.meta ? { ...user.meta } : {};

		meta[key] = value;

		this._saveUser({ ...this.props.user, meta });
	};

	_handleStatusChange = (description: string) => {
		this._handleMetaItemChange('description', description);
	};

	_handleOccupationChange = (occupation: string) => {
		this._handleMetaItemChange('occupation', occupation);
	};

	_handleNameChange = (name: string) => {
		this._saveUser({ ...this.props.user, name });
	};

	_handleGCMChange = (value: boolean) => {
		if (value) {
			GCM.enableNotifications();
		} else {
			GCM.disableNotifications();
		}

		this.setState({
			GCMEnabled: value,
		});
	};

	_handleEmailNotificationChange = (value: string) => {
		const {
			user,
		} = this.props;

		const params = user && user.params ? { ...user.params } : {};
		const email = params.email ? { ...params.email } : {};

		email.notifications = value;

		this.props.saveUser({ ...user, params: { ...params, email } });
	};

	_handleEmailFrequencyChange = (value: string) => {
		const {
			user,
		} = this.props;

		const params = user && user.params ? { ...user.params } : {};
		const email = params.email ? { ...params.email } : {};

		email.frequency = value;

		this.props.saveUser({ ...user, params: { ...params, email } });
	};

	_getSelectFrequencyHandler = (value: string) => {
		return () => this._handleEmailFrequencyChange(value);
	};

	_handleShowFrequencySheet = () => {
		this.setState({
			frequencySheetVisible: true,
		});
	};

	_handleRequestCloseFrequencySheet = () => {
		this.setState({
			frequencySheetVisible: false,
		});
	};

	_handleSignOut = () => {
		this.props.signOut();
	};

	render() {
		const { user } = this.props;

		if (!user) {
			return <PageEmpty label='Failed to load account' image={require('../../../../../assets/fail-experiment.png')} />;
		}

		if (user && user.type === 'loading') {
			return <PageLoading />;
		}

		let email;

		if (user.params) {
			email = user.params.email;
		}

		return (
			<ScrollView contentContainerStyle={styles.settings}>
				<View style={styles.section}>
					<AppText style={styles.header}>Personal information</AppText>
					<View style={styles.inputContainer}>
						<Icon
							style={styles.icon}
							name='face'
							size={18}
						/>
						<AppTextInput
							style={[ styles.input, styles.growing ]}
							defaultValue={user.name}
							placeholder='Full name'
							autoCapitalize='words'
							onChangeText={this._handleNameChange}
							underlineColorAndroid='transparent'
						/>
					</View>
					<View style={styles.inputContainer}>
						<Icon
							style={styles.icon}
							name='short-text'
							size={18}
						/>
						<AppTextInput
							style={[ styles.input, styles.growing ]}
							defaultValue={user.meta ? user.meta.description : ''}
							placeholder='Status'
							autoCapitalize='sentences'
							onChangeText={this._handleStatusChange}
							underlineColorAndroid='transparent'
							multiline
						/>
					</View>
					<View style={styles.inputContainer}>
						<Icon
							style={styles.icon}
							name='business-center'
							size={18}
						/>
						<AppTextInput
							style={[ styles.input, styles.growing ]}
							defaultValue={user.meta ? user.meta.occupation : ''}
							placeholder='Occupation'
							autoCapitalize='sentences'
							onChangeText={this._handleOccupationChange}
							underlineColorAndroid='transparent'
						/>
					</View>
				</View>
				<View style={styles.section}>
					<AppText style={styles.header}>Notifications</AppText>
					<View style={styles.item}>
						<View style={styles.itemLabel}>
							<AppText style={styles.itemText}>Push notifications</AppText>
						</View>
						<Switch
							value={this.state.GCMEnabled}
							onValueChange={this._handleGCMChange}
						/>
					</View>
					<View style={styles.item}>
						<View style={styles.itemLabel}>
							<AppText style={styles.itemText}>Mention notifications via email</AppText>
						</View>
						<Switch
							value={email ? email.notifications !== false : false}
							onValueChange={this._handleEmailNotificationChange}
						/>
					</View>
					<TouchFeedback onPress={this._handleShowFrequencySheet}>
						<View style={styles.item}>
							<View style={styles.itemLabel}>
								<AppText style={styles.itemText}>Email digest frequency</AppText>
								<AppText style={styles.itemValueText}>
									{email && email.frequency ?
										email.frequency.charAt(0).toUpperCase() + email.frequency.slice(1) :
										'Daily'
									}
								</AppText>
							</View>

							<ActionSheet
								visible={this.state.frequencySheetVisible}
								onRequestClose={this._handleRequestCloseFrequencySheet}
							>
								<ActionSheetItem onPress={this._getSelectFrequencyHandler('daily')}>
									Daily
								</ActionSheetItem>
								<ActionSheetItem onPress={this._getSelectFrequencyHandler('never')}>
									Never
								</ActionSheetItem>
							</ActionSheet>
						</View>
					</TouchFeedback>
				</View>
				<View style={styles.section}>
					<AppText style={styles.header}>Places</AppText>
					<TouchFeedback onPress={this._handleManagePlaces}>
						<View style={styles.item}>
							<View style={styles.itemLabel}>
								<AppText style={styles.itemText}>Add or remove places</AppText>
							</View>
						</View>
					</TouchFeedback>
				</View>
				<View style={styles.section}>
					<AppText style={styles.header}>Other</AppText>
					<TouchFeedback onPress={this._handleSignOut}>
						<View style={styles.item}>
							<View style={styles.itemLabel}>
								<AppText style={styles.itemText}>Sign out</AppText>
							</View>
						</View>
					</TouchFeedback>
				</View>
			</ScrollView>
		);
	}
}
