/* @flow */

import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import RoomsContainer from '../../containers/RoomsContainer';
import MyActivityContainer from '../../containers/MyActivityContainer';
import TabView from '../Core/TabView';

const styles = StyleSheet.create({
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
	{ key: 'groups', title: 'My Groups' },
	{ key: 'threads', title: 'My Activity' },
];

export default class Homescreen extends Component<void, *, void> {

	_renderScene = (scene: Scene) => {
		switch (scene.route.key) {
		case 'groups':
			return <RoomsContainer {...this.props} style={styles.container} />;
		case 'threads':
			return <MyActivityContainer {...this.props} style={styles.container} />;
		default:
			return null;
		}
	};

	render() {
		return (
			<TabView
				{...this.props}
				renderScene={this._renderScene}
				routes={routes}
			/>
		);
	}
}
