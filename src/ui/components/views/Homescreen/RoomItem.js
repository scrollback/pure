/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import Colors from '../../../Colors';
import AppText from '../AppText';
import ListItem from '../ListItem';
import Icon from '../Icon';
import Modal from '../Modal';
import Time from '../Time';
import Share from '../../../modules/Share';
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
		lineHeight: 15,
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

export default class RoomItem extends Component<void, Props, void> {
	static propTypes = {
		room: PropTypes.shape({
			id: PropTypes.string.isRequired,
			name: PropTypes.string,
		}),
		unread: PropTypes.bool,
		onSelect: PropTypes.func,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	_handleShowMenu: Function = () => {
		const { room } = this.props;

		const options = [];
		const actions = [];

		options.push('Share group');
		actions.push(() => {
			Share.shareItem('Share group', config.server.protocol + '//' + config.server.host + convertRouteToURL({
				name: 'room',
				props: {
					room: room.id,
				},
			}));
		});

		Modal.showActionSheetWithOptions({ options }, index => actions[index]());
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
			</ListItem>
		);
	}
}
