/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from '../Core/AppText';
import Icon from '../Core/Icon';
import AvatarRound from '../Avatar/AvatarRound';
import Time from '../Core/Time';
import TouchFeedback from '../Core/TouchFeedback';
import Colors from '../../../Colors';
import {
	NOTE_MENTION,
	NOTE_THREAD,
	NOTE_REPLY,
	NOTE_UPVOTE,
} from '../../../../lib/Constants';
import type { Note } from '../../../../lib/schemaTypes';

const {
	StyleSheet,
	View,
	PixelRatio,
	TouchableOpacity,
} = ReactNative;

const styles = StyleSheet.create({
	item: {
		backgroundColor: Colors.white,
		borderColor: Colors.separator,
		borderBottomWidth: 1 / PixelRatio.get(),
	},
	note: {
		flexDirection: 'row',
	},
	avatarContainer: {
		margin: 16,
		marginTop: 20,
		marginRight: 0,
	},
	content: {
		flex: 1,
		padding: 16,
	},
	title: {
		fontSize: 14,
		lineHeight: 21,
		color: Colors.grey,
	},
	summary: {
		fontSize: 12,
		lineHeight: 18,
		color: Colors.grey,
	},
	link: {
		color: Colors.info,
	},
	strong: {
		color: Colors.darkGrey,
	},
	timestampContainer: {
		flexDirection: 'row',
		marginTop: 4,
	},
	timestamp: {
		fontSize: 11,
		color: Colors.black,
		marginLeft: 4,
		paddingHorizontal: 4,
		opacity: 0.2,
	},
	icon: {
		color: Colors.black,
		opacity: 0.2,
	},
	metaIcon: {
		marginVertical: 2,
	},
	close: {
		backgroundColor: 'rgba(0, 0, 0, .1)',
		alignItems: 'center',
		justifyContent: 'center',
		height: 18,
		width: 18,
		borderRadius: 9,
		margin: 20,
	},
	badge: {
		position: 'absolute',
		alignItems: 'center',
		justifyContent: 'center',
		top: 21,
		right: -1,
		height: 17,
		width: 17,
		borderRadius: 9,
		borderColor: Colors.white,
		borderWidth: 1,
	},
	badgeIcon: {
		marginVertical: 1,
		textAlign: 'center',
		color: Colors.white,
	},
});

type Props = {
	note: Note;
	onDismiss: Function;
	onNavigate: Function;
}

export default class NotificationCenterItem extends Component<void, Props, void> {
	static propTypes = {
		note: PropTypes.shape({
			count: PropTypes.number,
			data: PropTypes.object.isRequired,
			dismissTime: PropTypes.number,
			event: PropTypes.number.isRequired,
			createTime: PropTypes.number,
			updateTime: PropTypes.number,
			group: PropTypes.string.isRequired,
			readTime: PropTypes.number,
			score: PropTypes.number,
			user: PropTypes.string,
		}).isRequired,
		onDismiss: PropTypes.func.isRequired,
		onNavigate: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_goToProfile = () => {
		this.props.onNavigate({
			type: 'push',
			payload: {
				name: 'profile',
				props: {
					user: this.props.note.data.creator,
				},
			},
		});
	}

	_getSummary = (note: Note) => {
		const { data, event, count } = note;
		const { room, thread } = data;

		const summary: Array<React.Element | string> = [];

		switch (event) {
		case NOTE_UPVOTE: {
			const isDiscussion = thread && data.id === thread.id;

			if (count > 1) {
				summary.push(<AppText key={1} style={styles.strong}>{count}</AppText>, ' new likes');
			} else {
				summary.push(<AppText key={1} style={styles.link}>{data.creator}</AppText>, ' liked your ' + (isDiscussion ? 'discussion' : 'reply'));
			}

			if (!isDiscussion && thread && thread.name) {
				summary.push(' in ', <AppText key={2} style={styles.strong}>{thread.name}</AppText>);
			}

			if (room && room.name) {
				summary.push(' - ', <AppText key={3} style={styles.strong}>{room.name}</AppText>);
			}

			break;
		}
		case NOTE_MENTION:
			if (count > 1) {
				summary.push(<AppText key={1} style={styles.strong}>{count}</AppText>, ' new mentions');
			} else {
				summary.push(<AppText key={1} style={styles.link}>{data.creator}</AppText>, ' mentioned you');
			}

			if (thread && thread.name) {
				summary.push(' in ', <AppText key={2} style={styles.strong}>{thread.name}</AppText>);
			}

			if (room && room.name) {
				summary.push(' - ', <AppText key={3} style={styles.strong}>{room.name}</AppText>);
			}

			break;
		case NOTE_REPLY:
			if (count > 1) {
				summary.push(<AppText key={1} style={styles.strong}>{count}</AppText>, ' new replies');
			} else {
				summary.push(<AppText key={1} style={styles.link}>{data.creator}</AppText>, ' replied');
			}

			if (thread && thread.name) {
				summary.push(' to ', <AppText key={2} style={styles.strong}>{thread.name}</AppText>);
			}

			if (room && room.name) {
				summary.push(' in ', <AppText key={3} style={styles.strong}>{room.name}</AppText>);
			}

			break;
		case NOTE_THREAD:
			if (count > 1) {
				summary.push(<AppText key={1} style={styles.strong}>{count}</AppText>, ' new discussions');
			} else {
				summary.push(<AppText key={1} style={styles.link}>{data.creator}</AppText>, ' started a discussion');
			}

			if (room && room.name) {
				summary.push(' in ', <AppText key={3} style={styles.strong}>{room.name}</AppText>);
			}

			break;
		default:
			if (count > 1) {
				summary.push(<AppText key={1} style={styles.strong}>{count}</AppText>, ' new notifications');
			} else {
				summary.push('New notification from ', <AppText key={1} style={styles.strong}>{data.creator}</AppText>);
			}

			if (room && room.name) {
				summary.push(' in ', <AppText key={2} style={styles.strong}>{room.name}</AppText>);
			}
		}

		return summary;
	};

	_getIconColor = () => {
		const { note } = this.props;

		switch (note.event) {
		case NOTE_UPVOTE:
			return Colors.accent;
		case NOTE_MENTION:
			return '#ff5722';
		case NOTE_REPLY:
			return '#2196F3';
		case NOTE_THREAD:
			return '#009688';
		default:
			return '#673ab7';
		}
	};

	_getIconName = () => {
		const { note } = this.props;

		switch (note.event) {
		case NOTE_UPVOTE:
			return 'favorite';
		case NOTE_MENTION:
			return 'person';
		case NOTE_REPLY:
			return 'reply';
		case NOTE_THREAD:
			return 'create';
		default:
			return 'notifications';
		}
	};

	_handlePress = () => {
		const { note, onNavigate } = this.props;

		const { data, event, count } = note;

		switch (event) {
		case NOTE_UPVOTE:
		case NOTE_MENTION:
		case NOTE_REPLY:
			onNavigate({
				type: 'push',
				payload: {
					name: 'chat',
					props: {
						thread: data.thread ? data.thread.id : null,
						room: data.room ? data.room.id : null,
					},
				},
			});

			break;
		case NOTE_THREAD:
			if (count > 1) {
				onNavigate({
					type: 'push',
					payload: {
						name: 'room',
						props: {
							room: data.room ? data.room.id : null,
						},
					},
				});
			} else {
				onNavigate({
					type: 'push',
					payload: {
						name: 'chat',
						props: {
							thread: data.thread ? data.thread.id : null,
							room: data.room ? data.room.id : null,
						},
					},
				});
			}

			break;
		default:
			onNavigate({
				type: 'push',
				payload: {
					name: 'room',
					props: {
						room: data.room ? data.room.id : null,
					},
				},
			});
		}

		this.props.onDismiss();
	};

	render() {
		const { note } = this.props;

		return (
			<TouchFeedback onPress={this._handlePress}>
				<View style={styles.item}>
					<View style={styles.note}>
						<View style={styles.avatarContainer}>
							<TouchableOpacity onPress={this._goToProfile}>
								<AvatarRound
									user={note.data.creator}
									size={36}
								/>
							</TouchableOpacity>
							<View style={[ styles.badge, { backgroundColor: this._getIconColor() } ]}>
								<Icon
									name={this._getIconName()}
									style={styles.badgeIcon}
									size={8}
								/>
							</View>
						</View>
						<View style={styles.content}>
							<View>
								<AppText numberOfLines={5} style={styles.title}>
									{this._getSummary(note)}
								</AppText>
							</View>
							<View>
								<AppText numberOfLines={1} style={styles.summary}>
									{note.data.body}
								</AppText>
							</View>
							<View style={styles.timestampContainer}>
								<Icon
									name='access-time'
									style={[ styles.icon, styles.metaIcon ]}
									size={12}
								/>
								<Time
									type='long'
									time={note.updateTime}
									style={styles.timestamp}
								/>
							</View>
						</View>
						<TouchableOpacity onPress={this.props.onDismiss}>
							<View style={styles.close}>
								<Icon
									name='close'
									style={styles.icon}
									size={12}
								/>
							</View>
						</TouchableOpacity>
					</View>
				</View>
			</TouchFeedback>
		);
	}
}
