/* @flow */

import React, { PropTypes, Component } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import Card from './Card';
import CardTitle from './CardTitle';
import DiscussionSummary from './DiscussionSummary';
import DiscussionFooter from './DiscussionFooter';
import type { Thread } from '../../../lib/schemaTypes';

const {
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	details: {
		paddingVertical: 4,
		marginVertical: 0,
	},

	title: {
		marginVertical: 8,
		marginHorizontal: 16,
	},

	footer: {
		marginHorizontal: 16,
		marginTop: 8,
		marginBottom: 12,
	},
});

type Props = {
	thread: Thread;
	onNavigation: Function;
}

export default class DiscussionDetailsCard extends Component<void, Props, void> {
	static propTypes = {
		thread: PropTypes.shape({
			name: PropTypes.string.isRequired,
			body: PropTypes.string.isRequired,
			meta: PropTypes.object,
			creator: PropTypes.string.isRequired,
		}),
		onNavigation: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		const {
			thread,
		} = this.props;

		return (
			<Card style={styles.details}>
				<CardTitle style={styles.title}>{thread.name}</CardTitle>
				<DiscussionSummary text={thread.body} meta={thread.meta} />
				<DiscussionFooter { ...this.props } style={styles.footer} />
			</Card>
		);
	}
}
