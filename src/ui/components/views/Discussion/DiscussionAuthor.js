/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from '../Core/AppText';
import AvatarRound from '../Avatar/AvatarRound';
import Time from '../Core/Time';
import Colors from '../../../Colors';
import type { Thread } from '../../../../lib/schemaTypes';

const {
	StyleSheet,
	TouchableOpacity,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	author: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 8,
	},

	name: {
		color: Colors.info,
		fontWeight: 'bold',
		fontSize: 12,
		lineHeight: 18,
		marginLeft: 8,
	},

	label: {
		color: Colors.grey,
		fontSize: 10,
		lineHeight: 15,
	},

	dot: {
		color: Colors.grey,
		fontSize: 3,
		lineHeight: 3,
		marginHorizontal: 8,
	},
});

type Props = {
	thread: Thread;
	onNavigate: Function;
	style?: any;
}

export default class DiscussionAuthor extends Component<void, Props, void> {
	static propTypes = {
		thread: PropTypes.shape({
			updateTime: PropTypes.number.isRequired,
			creator: PropTypes.string.isRequired,
			counts: PropTypes.shape({
				children: PropTypes.number,
			}),
		}).isRequired,
		onNavigate: PropTypes.func.isRequired,
		style: View.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_goToProfile: Function = () => {
		const { thread } = this.props;

		this.props.onNavigate({
			type: 'push',
			payload: {
				name: 'profile',
				props: {
					user: thread.creator,
				},
			},
		});
	};

	render() {
		const {
			thread,
		} = this.props;

		return (
			<View {...this.props} style={[ styles.author, this.props.style ]}>
				<TouchableOpacity
					activeOpacity={0.5}
					onPress={this._goToProfile}
					style={styles.avatar}
				>
					<AvatarRound
						size={24}
						user={thread.creator}
					/>
				</TouchableOpacity>
				<AppText style={styles.name}>{thread.creator}</AppText>
				<AppText style={styles.dot}>●</AppText>
				<Time
					style={styles.label}
					type='long'
					time={thread.createTime}
				/>
			</View>
		);
	}
}
