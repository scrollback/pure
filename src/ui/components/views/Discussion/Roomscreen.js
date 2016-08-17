/* @flow */

import React, { PropTypes, Component } from 'react';
import { View, StyleSheet } from 'react-native';
import DiscussionsContainer from '../../containers/DiscussionsContainer';
import StartDiscussionButton from '../StartDiscussion/StartDiscussionButton';
import TabView from '../Core/TabView';

const styles = StyleSheet.create({
	outer: {
		flex: 1,
	},
	container: {
		flex: 1,
		elevation: 4,
	},
});

type Route = {
	key: string;
}

type Scene = {
	route: Route;
}

const routes = [
	{ key: 'createTime', title: 'Latest' },
	{ key: 'score', title: 'Popular' },
];

export default class Roomscreen extends Component<void, *, void> {

	static propTypes = {
		room: PropTypes.string.isRequired,
		onNavigate: PropTypes.func.isRequired,
	}

	_renderScene = (scene: Scene) => {
		return (
			<DiscussionsContainer
				{...this.props}
				sortBy={scene.route.key}
				style={styles.container}
			/>
		);
	};

	render() {
		return (
			<View style={styles.outer}>
				<TabView
					{...this.props}
					renderScene={this._renderScene}
					routes={routes}
				/>

				<StartDiscussionButton
					room={this.props.room}
					onNavigate={this.props.onNavigate}
				/>
			</View>
		);
	}
}
