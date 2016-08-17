/* @flow */

import React, { PropTypes, Component } from 'react';
import { StyleSheet } from 'react-native';
import { TabViewAnimated, TabViewPage, TabBarTop } from 'react-native-tab-view';
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

type State = {
	index: number;
}

export default class LazyTabView extends Component<void, any, State> {

	static propTypes = {
		routes: PropTypes.arrayOf(PropTypes.object).isRequired,
		renderScene: PropTypes.func.isRequired,
	}

	state: State = {
		index: 0,
	};

	_handleChangeTab = (index: number) => {
		this.setState({
			index,
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

	_renderTabView = (props: any) => {
		return <TabViewPage {...props} renderScene={this.props.renderScene} />;
	};

	render() {
		return (
			<TabViewAnimated
				lazy
				style={[ this.props.style, styles.container ]}
				navigationState={{
					index: this.state.index,
					routes: this.props.routes,
				}}
				renderScene={this._renderTabView}
				renderHeader={this._renderHeader}
				onRequestChangeTab={this._handleChangeTab}
			/>
		);
	}
}
