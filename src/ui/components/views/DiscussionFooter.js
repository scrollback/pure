/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import Colors from '../../Colors';
import AppText from './AppText';
import Icon from './Icon';
import CardAuthor from './CardAuthor';
import Time from './Time';
import type { Thread } from '../../../lib/schemaTypes';

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	footer: {
		flexDirection: 'row',
		marginTop: 6,
	},
	left: {
		flex: 1,
	},
	right: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
	},
	info: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	label: {
		color: Colors.black,
		fontSize: 12,
		lineHeight: 18,
		marginLeft: 8,
		marginRight: 16,
		paddingHorizontal: 4,
	},
	icon: {
		color: Colors.black,
	},
	faded: {
		opacity: 0.3,
	},
});

type Props = {
	thread: Thread;
	style?: any;
}

export default class DiscussionFooter extends Component<void, Props, void> {
	static propTypes = {
		thread: PropTypes.shape({
			updateTime: PropTypes.number.isRequired,
			creator: PropTypes.string.isRequired,
			counts: PropTypes.shape({
				children: PropTypes.number,
			}),
		}).isRequired,
		style: View.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		const {
			thread,
		} = this.props;

		return (
			<View {...this.props} style={[ styles.footer, this.props.style ]}>
				<CardAuthor nick={thread.creator} style={styles.left} />

				<View style={styles.right}>
					<View style={[ styles.info, styles.faded ]}>
						<Icon
							name='access-time'
							style={styles.icon}
							size={24}
						/>
						<Time
							type='short'
							time={thread.updateTime}
							style={styles.label}
						/>
					</View>
					<View style={[ styles.info, styles.faded ]}>
						<Icon
							name='forum'
							style={styles.icon}
							size={24}
						/>
						<AppText style={styles.label}>{thread.counts && thread.counts.children ? (thread.counts.children + 1) : 1}</AppText>
					</View>
				</View>
			</View>
		);
	}
}
