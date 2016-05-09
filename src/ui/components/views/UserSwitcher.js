/* @flow */

import React, { Component, PropTypes } from 'react';
import StatusbarWrapper from './StatusbarWrapper';
import ReactNative from 'react-native';
import AvatarRound from './AvatarRound';
import AppText from './AppText';
import Colors from '../../Colors';

const {
	View,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		width: 56,
		backgroundColor: '#000',
	},

	current: {
		backgroundColor: Colors.info,
	},

	avatar: {
		backgroundColor: 'rgba(255, 255, 255, .16)',
		marginTop: 8,
		marginHorizontal: 6,
	},

	nick: {
		color: Colors.white,
		fontSize: 12,
		lineHeight: 18,
		textAlign: 'center',
		marginVertical: 4,
	},
});

type Props = {
	data: Array<{ user: string; session: string }>;
	user: string;
	switchUser: Function;
}

export default class UserSwitcher extends Component<void, Props, void> {
	static propTypes = {
		data: PropTypes.arrayOf(PropTypes.shape({
			user: PropTypes.string,
			session: PropTypes.string,
		})),
		user: PropTypes.string.isRequired,
		switchUser: PropTypes.func.isRequired,
	};

	render() {
		const {
			data,
			user,
		} = this.props;

		return (
			<View style={styles.container}>
				<ScrollView>
				<StatusbarWrapper />
				{data.map(it => (
					<TouchableOpacity key={it.user} onPress={() => this.props.switchUser(it)}>
						<View style={it.user === user ? styles.current : null}>
							<AvatarRound
								style={styles.avatar}
								user={it.user}
								size={44}
							/>
							<AppText numberOfLines={1} style={styles.nick}>{it.user}</AppText>
						</View>
					</TouchableOpacity>
				))}
				</ScrollView>
			</View>
		);
	}
}
