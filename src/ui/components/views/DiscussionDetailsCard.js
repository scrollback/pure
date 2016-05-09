/* @flow */

import React, { PropTypes, Component } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import Card from './Card';
import CardTitle from './CardTitle';
import DiscussionSummary from './DiscussionSummary';
import CardAuthor from './CardAuthor';

const {
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	details: {
		paddingVertical: 12,
		marginVertical: 0,
	},

	title: {
		marginBottom: 8,
		marginHorizontal: 16,
	},

	author: {
		marginTop: 8,
		marginHorizontal: 16,
	},
});

type Props = {
	thread: {
		name: string;
		body: string;
		creator: string;
		meta?: Object;
	}
}

export default class DiscussionDetailsCard extends Component<void, Props, void> {
	static propTypes = {
		thread: PropTypes.shape({
			name: PropTypes.string.isRequired,
			body: PropTypes.string.isRequired,
			meta: PropTypes.object,
			creator: PropTypes.string.isRequired,
		}),
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		const { thread } = this.props;

		return (
			<Card style={styles.details}>
				<CardTitle style={styles.title}>{thread.name}</CardTitle>
				<DiscussionSummary text={thread.body} meta={thread.meta} />
				<CardAuthor nick={thread.creator} style={styles.author} />
			</Card>
		);
	}
}
