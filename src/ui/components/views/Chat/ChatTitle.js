/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import Colors from '../../../Colors';
import AppText from '../Core/AppText';
import AppbarTouchable from '../Appbar/AppbarTouchable';
import type { Thread } from '../../../../lib/schemaTypes';

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		marginRight: 64,
		height: 56,
		justifyContent: 'center',
	},
	title: {
		color: Colors.white,
		fontWeight: 'bold',
	},
	subtitle: {
		color: Colors.fadedWhite,
		fontSize: 12,
		width: 160,
	},
});

type Props = {
	thread: ?Thread | { type: 'loading' };
	online: number;
	onNavigate: Function;
}

export default class ChatTitle extends Component<void, Props, void> {
	static propTypes = {
		thread: PropTypes.shape({
			name: PropTypes.string,
		}),
		online: PropTypes.number.isRequired,
		onNavigate: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handlePress = () => {
		const { thread } = this.props;

		if (thread && thread.id) {
			this.props.onNavigate({
				type: 'push',
				payload: {
					name: 'details',
					props: {
						thread: thread.id,
					},
				},
			});
		}
	};

	render() {
		const {
			thread,
			online,
		} = this.props;

		let title;

		if (thread && thread.type === 'loading') {
			title = 'Loading…';
		} else if (thread && thread.name) {
			title = thread.name;
		} else {
			title = '…';
		}

		return (
			<AppbarTouchable onPress={this._handlePress} style={styles.container}>
				<View style={styles.container}>
					<AppText numberOfLines={1} style={styles.title}>
						{title}
					</AppText>
					<AppText numberOfLines={1} style={styles.subtitle}>
						{online} {online === 1 ? 'person' : 'people'} online
					</AppText>
				</View>
			</AppbarTouchable>
		);
	}
}
