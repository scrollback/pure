/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import ProfileField from './ProfileField';
import AppText from '../AppText';
import AvatarRound from '../AvatarRound';
import PageLoading from '../PageLoading';
import PageEmpty from '../PageEmpty';
import NavigationActions from '../../../navigation-rfc/Navigation/NavigationActions';
import Colors from '../../../Colors';
import {
	ROLE_HOME,
	ROLE_WORK,
	ROLE_HOMETOWN,
} from '../../../../lib/Constants';
import type { User } from '../../../../lib/schemaTypes';

const {
	Image,
	StyleSheet,
	ScrollView,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white,
	},

	cover: {
		height: null,
		width: null,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 16,
	},

	tint: {
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		backgroundColor: Colors.primary,
		opacity: 0.7,
	},

	info: {
		padding: 8,
	},

	id: {
		color: Colors.white,
		fontWeight: 'bold',
		fontSize: 24,
		lineHeight: 36,
		textAlign: 'center',
	},

	name: {
		color: Colors.white,
		fontSize: 14,
		lineHeight: 21,
		textAlign: 'center',
		opacity: 0.7,
	},

	avatar: {
		margin: 8,
		elevation: 2,
	},
});

type Props = {
	currentUser: string;
	user: { type: 'loading' } | User | null;
	places: {
		[type: number]: Array<string>;
	};
	onNavigation: Function;
}

const PLACE_TYPES = [ ROLE_HOME, ROLE_WORK, ROLE_HOMETOWN ];

const PLACE_HEADERS = {
	[ROLE_HOME]: 'home',
	[ROLE_WORK]: 'work',
	[ROLE_HOMETOWN]: 'hometown',
};

const PLACE_LABELS = {
	[ROLE_HOME]: 'Add where you live',
	[ROLE_WORK]: 'Add where you work or study',
	[ROLE_HOMETOWN]: 'Add your hometown',
};

export default class Profile extends Component<void, Props, void> {
	static propTypes = {
		currentUser: PropTypes.string.isRequired,
		user: PropTypes.oneOfType([
			PropTypes.oneOf([ 'loading' ]),
			PropTypes.shape({
				id: PropTypes.string,
				meta: PropTypes.shape({
					picture: PropTypes.string,
					description: PropTypes.string,
				}),
			}),
		]),
		places: PropTypes.any.isRequired,
		onNavigation: PropTypes.func.isRequired,
	};

	_goToAccount: Function = () => {
		this.props.onNavigation(new NavigationActions.Push({
			name: 'account',
		}));
	};

	_goToPlaces: Function = () => {
		this.props.onNavigation(new NavigationActions.Push({
			name: 'places',
		}));
	};

	render() {
		const {
			currentUser,
			user,
			places,
		} = this.props;

		if (!user) {
			return <PageEmpty label='Failed to load profile' image='sad' />;
		}

		if (user && user.type === 'loading') {
			return <PageLoading />;
		}

		const own = currentUser === user.id;

		return (
			<View style={styles.container}>
				<ScrollView>
					<Image style={styles.cover} source={require('../../../../../assets/profile-cover.jpg')}>
						<View style={styles.tint} />
						<View style={styles.coverInner}>
							<AvatarRound
								style={styles.avatar}
								user={user.id}
								size={160}
							/>
							<View style={styles.info}>
								<AppText style={styles.id}>{user.id}</AppText>
								{user.name ?
									<AppText style={styles.name}>{user.name}</AppText> :
									null
								}
							</View>
						</View>
					</Image>
					<View style={styles.info}>
						<ProfileField
							action={own ? 'Add status' : null}
							header='Status'
							value={user.meta ? user.meta.description : null}
							onEdit={this._goToAccount}
						/>
						<ProfileField
							action={own ? 'Add occupation' : null}
							header='Occupation'
							value={user.meta ? user.meta.occupation : null}
							onEdit={this._goToAccount}
						/>
						{PLACE_TYPES.map(type => {
							const names = places[type];

							return (
								<ProfileField
									key={type}
									action={
										own && !(user.params && user.params.places && user.params.places[PLACE_HEADERS[type]]) ?
										PLACE_LABELS[type] :
										null
									}
									header={PLACE_HEADERS[type]}
									value={names ? names[0] : null}
									onEdit={this._goToPlaces}
								/>
							);
						})}
						{own ? (
							<ProfileField
								header='Email address (Private)'
								value={user.identities[user.identities.length - 1].slice(7)}
								onEdit={this._goToAccount}
							/>
							) :
							null
						}
					</View>
				</ScrollView>
				</View>
			);
	}
}
