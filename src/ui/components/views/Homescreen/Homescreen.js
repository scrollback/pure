/* @flow */

import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { TabViewAnimated, TabViewPage, TabBarTop } from 'react-native-tab-view';
import RoomsContainer from '../../containers/RoomsContainer';
import MyActivityContainer from '../../containers/MyActivityContainer';
import AppText from '../Core/AppText';
import Colors from '../../../Colors';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		elevation: 4,
	},
	tabbar: {
		backgroundColor: Colors.primary,
	},
	tablabel: {
		fontSize: 13,
		color: Colors.white,
		margin: 8,
	},
	indicator: {
		backgroundColor: Colors.accent,
	},
});

type Route = {
	title: string;
	key: string;
}

type NavigationState = {
	index: number;
	routes: Array<Route>;
}

type State = {
	navigation: NavigationState;
}

export default class Homescreen extends Component<void, any, State> {
	state: State = {
		navigation: {
			index: 0,
			routes: [
				{ key: 'groups', title: 'My Groups' },
				{ key: 'threads', title: 'My Activity' },
			],
		},
	};

	_handleChangeTab = (index: number) => {
		this.setState({
			navigation: { ...this.state.navigation, index },
		});
	};

	_renderLabel = ({ route }: { route: Route }) => {
		return <AppText style={styles.tablabel}>{route.title.toUpperCase()}</AppText>;
	};

	_renderHeader = (props: any) => {
		return (
			<TabBarTop
				{...props}
				renderLabel={this._renderLabel}
				indicatorStyle={styles.indicator}
				style={styles.tabbar}
			/>
		);
	};

	_renderScene = ({ route }: { route: Route }) => {
		switch (route.key) {
		case 'groups':
			return <RoomsContainer {...this.props} style={styles.container} />;
		case 'threads':
			return <MyActivityContainer {...this.props} style={styles.container} />;
		default:
			return null;
		}
	};

	_renderTabView = (props: any) => {
		return <TabViewPage {...props} renderScene={this._renderScene} />;
	};

	render() {
		return (
			<TabViewAnimated
				style={[ this.props.style, styles.container ]}
				navigationState={this.state.navigation}
				renderScene={this._renderTabView}
				renderHeader={this._renderHeader}
				onRequestChangeTab={this._handleChangeTab}
			/>
		);
	}
}
