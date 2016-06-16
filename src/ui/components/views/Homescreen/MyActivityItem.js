/* @flow */

import React, { Component, PropTypes } from 'react';
import {
	View,
	PixelRatio,
	StyleSheet,
} from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import Card from '../Card/Card';
import AppText from '../Core/AppText';
import DiscussionItemBase from '../Discussion/DiscussionItemBase';
import Colors from '../../../Colors';
import {
	ROLE_MENTIONED,
	ROLE_UPVOTE,
} from '../../../../lib/Constants';

const styles = StyleSheet.create({
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomWidth: 1 / PixelRatio.get(),
		borderBottomColor: Colors.separator,
		paddingHorizontal: 16,
		paddingVertical: 6,
	},

	label: {
		color: Colors.grey,
		fontSize: 12,
	},

	title: {
		color: Colors.darkGrey,
		fontSize: 12,
		fontWeight: 'bold',
	},

	dot: {
		color: Colors.grey,
		fontSize: 3,
		marginHorizontal: 6,
	},
});

export default class RoomItem extends Component<void, any, any> {
	static propTypes = {
		room: PropTypes.shape({
			id: PropTypes.string.isRequired,
			name: PropTypes.string,
		}),
		style: Card.propTypes.style,
	};

	shouldComponentUpdate(nextProps: any, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		const { room, style, ...rest } = this.props;
		const { user, thread, threadrel } = rest;

		let activityText = '';

		if (threadrel && threadrel.roles) {
			const { roles } = threadrel;

			if (roles.indexOf(ROLE_UPVOTE) > -1) {
				activityText = 'You liked this';
			} else if (roles.indexOf(ROLE_MENTIONED) > -1) {
				activityText = 'You were mentioned in this';
			} else {
				if (thread.creator === user) {
					activityText = 'You posted this';
				} else {
					activityText = 'You replied to this';
				}
			}
		}

		return (
			<Card style={style}>
				<View style={styles.header}>
					<AppText style={styles.label}>{activityText}</AppText>
					<AppText style={styles.dot}>●</AppText>
					<AppText style={styles.title}>{room.name} </AppText>
				</View>
				<DiscussionItemBase {...rest} />
			</Card>
		);
	}
}
