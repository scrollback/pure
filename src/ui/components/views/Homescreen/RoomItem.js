/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from '../Core/AppText';
import ListItem from '../Core/ListItem';
import Time from '../Core/Time';
import Colors from '../../../Colors';
import { convertRouteToURL } from '../../../../lib/Route';
import { config } from '../../../../core-client';
import type { Room } from '../../../../lib/schemaTypes';

const {
	StyleSheet,
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
});

type Props = {
	room: Room;
	unread?: boolean;
	onSelect: Function;
}

export default class RoomItem extends Component<void, Props, void> {
	static propTypes = {
		room: PropTypes.shape({
			id: PropTypes.string.isRequired,
			name: PropTypes.string,
		}),
		unread: PropTypes.bool,
		onSelect: PropTypes.func,
	};

	shouldComponentUpdate(nextProps: Props, nextState: void): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_getRoomLink = () => {
		const { room } = this.props;

		return config.server.protocol + '//' + config.server.host + convertRouteToURL({
			name: 'room',
			props: {
				room: room.id,
			},
		});
	};

	_handlePress = () => {
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
			</ListItem>
		);
	}
}
