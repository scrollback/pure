/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from '../Core/AppText';
import ListItem from '../Core/ListItem';
import Icon from '../Core/Icon';
import Time from '../Core/Time';
import ActionSheet from '../Core/ActionSheet';
import ActionSheetItem from '../Core/ActionSheetItem';
import Share from '../../../modules/Share';
import Colors from '../../../Colors';
import { convertRouteToURL } from '../../../../lib/Route';
import { config } from '../../../../core-client';

const {
	StyleSheet,
	TouchableOpacity,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	item: {
		flex: 1,
		justifyContent: 'center',
		paddingHorizontal: 16,
	},

	title: {
		color: Colors.darkGrey,
		fontWeight: 'bold',
	},

	subtitle: {
		flexDirection: 'row',
		alignItems: 'center',
	},

	label: {
		color: Colors.grey,
		fontSize: 10,
	},

	dot: {
		fontSize: 2,
		lineHeight: 3,
		marginHorizontal: 4,
	},

	badge: {
		backgroundColor: Colors.accent,
		height: 6,
		width: 6,
		marginRight: 8,
		borderRadius: 3,
		elevation: 1,
	},

	expand: {
		margin: 20,
		color: Colors.fadedBlack,
	},
});

type Props = {
	room: {
		id: string;
		name: string;
		updateTime?: number;
	};
	unread?: boolean;
	onSelect: Function;
}

type State = {
	actionSheetVisible: boolean;
}

export default class RoomItem extends Component<void, Props, State> {
	static propTypes = {
		room: PropTypes.shape({
			id: PropTypes.string.isRequired,
			name: PropTypes.string,
		}),
		unread: PropTypes.bool,
		onSelect: PropTypes.func,
	};

	state: State = {
		actionSheetVisible: false,
	};

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_getRoomLink: Function = () => {
		const { room } = this.props;

		return config.server.protocol + '//' + config.server.host + convertRouteToURL({
			name: 'room',
			props: {
				room: room.id,
			},
		});
	};

	_getShareText: Function = () => {
		const { room } = this.props;

		return `Hey! Join me in the ${room.name} group on ${config.app_name}.\n${this._getRoomLink()}`;
	};

	_handleInvite: Function = () => {
		Share.shareItem('Share group', this._getShareText());
	};

	_handleShowMenu: Function = () => {
		this.setState({
			actionSheetVisible: true,
		});
	};

	_handleRequestClose: Function = () => {
		this.setState({
			actionSheetVisible: false,
		});
	};

	_handlePress: Function = () => {
		if (this.props.onSelect) {
			this.props.onSelect(this.props.room);
		}
	};

	render() {
		const {
			room,
			unread,
		} = this.props;

		const followers = room.counts && room.counts.follower ? room.counts.follower : 0;

		let followersLabel;

		switch (followers) {
		case 1:
			followersLabel = '1 person';
			break;
		default:
			followersLabel = `${followers > 1000 ? Math.round(followers / 100) / 10 + 'k' : followers} people`;
		}

		return (
			<ListItem {...this.props} onPress={this._handlePress}>
				<View style={styles.item}>
					<AppText numberOfLines={1} style={styles.title}>{room.name || 'Loading…'}</AppText>
					{room.updateTime ?
						<View style={styles.subtitle}>
							{unread ?
								<View style={styles.badge} /> :
								null
							}
							<Time
								style={styles.label}
								time={room.updateTime}
								type='long'
							/>
							<AppText style={styles.dot}>●</AppText>
							<AppText style={styles.label}>{followersLabel}</AppText>
						</View> :
						null
					}
				</View>

				<TouchableOpacity onPress={this._handleShowMenu}>
					<Icon
						name='expand-more'
						style={styles.expand}
						size={20}
					/>
				</TouchableOpacity>

				<ActionSheet visible={this.state.actionSheetVisible} onRequestClose={this._handleRequestClose}>
					<ActionSheetItem onPress={this._handleInvite}>
						Invite friends to group
					</ActionSheetItem>
				</ActionSheet>
			</ListItem>
		);
	}
}
