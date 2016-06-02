/* @flow */

import React, { PropTypes, Component } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import Card from '../Card/Card';
import CardTitle from '../Card/CardTitle';
import DiscussionSummary from './DiscussionSummary';
import DiscussionAuthor from './DiscussionAuthor';
import type { Thread } from '../../../../lib/schemaTypes';

const {
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	details: {
		marginVertical: 0,
	},

	title: {
		marginHorizontal: 16,
	},

	author: {
		marginHorizontal: 16,
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

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		const {
			thread,
		} = this.props;

		return (
			<Card style={styles.details}>
				<DiscussionAuthor { ...this.props } style={styles.author} />
				<CardTitle style={styles.title}>{thread.name}</CardTitle>
				<DiscussionSummary text={thread.body} meta={thread.meta} />
			</Card>
		);
	}
}
