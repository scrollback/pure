/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AvatarRound from './Avatar/AvatarRound';
import AppText from './Core/AppText';
import Colors from '../../Colors';

const {
	View,
	ListView,
	StyleSheet,
	TouchableOpacity,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		width: 56,
		backgroundColor: Colors.black,
	},

	current: {
		backgroundColor: Colors.accent,
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

type State = {
	dataSource: ListView.DataSource;
}

export default class UserSwitcher extends Component<void, Props, State> {
	static propTypes = {
		data: PropTypes.arrayOf(PropTypes.shape({
			user: PropTypes.string,
			session: PropTypes.string,
		})),
		user: PropTypes.string.isRequired,
		switchUser: PropTypes.func.isRequired,
	};

	state: State = {
		dataSource: new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2,
		}),
	};

	componentWillMount() {
		this.setState({
			dataSource: this.state.dataSource.cloneWithRows(this.props.data),
		});
	}

	componentWillReceiveProps(nextProps: Props) {
		this.setState({
			dataSource: this.state.dataSource.cloneWithRows(nextProps.data),
		});
	}

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_renderRow: Function = (item) => {
		const {
			user,
		} = this.props;

		return (
			<TouchableOpacity key={item.user} onPress={() => this.props.switchUser(item)}>
				<View style={item.user === user ? styles.current : null}>
					<AvatarRound
						style={styles.avatar}
						user={item.user}
						size={44}
					/>
					<AppText numberOfLines={1} style={styles.nick}>{item.user}</AppText>
				</View>
			</TouchableOpacity>
		);
	};

	render() {
		return (
			<View style={styles.container}>
				<ListView
					removeClippedSubviews
					dataSource={this.state.dataSource}
					renderRow={this._renderRow}
				/>
			</View>
		);
	}
}
