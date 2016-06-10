/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from '../Core/AppText';
import AvatarRound from '../Avatar/AvatarRound';
import TouchFeedback from '../Core/TouchFeedback';
import Colors from '../../../Colors';
import type { User } from '../../../../lib/schemaTypes';

const {
	StyleSheet,
	PixelRatio,
	TouchableOpacity,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	item: {
		backgroundColor: Colors.white,
		borderColor: Colors.separator,
		borderBottomWidth: 1 / PixelRatio.get(),
	},
	person: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	avatar: {
		marginHorizontal: 16,
		marginVertical: 12,
	},
	nick: {
		flex: 1,
	},
	nickText: {
		color: Colors.darkGrey,
	},
	status: {
		fontSize: 12,
		marginHorizontal: 16,
		paddingHorizontal: 4,
		color: Colors.darkGrey,
	},
	online: {
		color: Colors.success,
		fontWeight: 'bold',
	},
	offline: {
		opacity: 0.5,
	},
});

type Props = {
	user: User;
	status: 'online' | 'offline';
	onNavigate: Function;
}

export default class PeopleListItem extends Component<void, Props, void> {
	static propTypes = {
		user: PropTypes.shape({
			id: PropTypes.string.isRequired,
		}),
		status: PropTypes.string,
		onNavigate: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_goToProfile = () => {
		const { user } = this.props;

		this.props.onNavigate({
			type: 'push',
			payload: {
				name: 'profile',
				props: {
					user: user.id,
				},
			},
		});
	};

	render() {
		const {
			user,
			status,
		} = this.props;

		return (
			<View style={styles.item}>
				<TouchFeedback>
					<View style={styles.person}>
						<TouchableOpacity
							activeOpacity={0.5}
							onPress={this._goToProfile}
							style={styles.avatar}
						>
							<AvatarRound
								size={36}
								user={user.id}
							/>
						</TouchableOpacity>
						<View style={styles.nick}>
							<AppText style={[ styles.nickText, status !== 'online' ? styles.offline : null ]}>
								{user.id}
							</AppText>
						</View>
						<View>
							<AppText style={[ styles.status, status === 'online' ? styles.online : styles.offline ]}>
								{status.toUpperCase()}
							</AppText>
						</View>
					</View>
				</TouchFeedback>
			</View>
		);
	}
}
