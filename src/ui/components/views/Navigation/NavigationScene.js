/* @flow */
/* eslint-disable no-undefined */

import React, { Component, PropTypes } from 'react';
import {
	View,
	StyleSheet,
	StatusBar,
	NavigationExperimental,
} from 'react-native';
import AppbarTouchable from '../Appbar/AppbarTouchable';
import AppbarIcon from '../Appbar/AppbarIcon';
import AppbarTitle from '../Appbar/AppbarTitle';
import BannerOfflineContainer from '../../containers/BannerOfflineContainer';
import Colors from '../../../Colors';
import type { Route } from '../../../../lib/RouteTypes';

const {
	Card: NavigationCard,
} = NavigationExperimental;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	left: {
		position: 'absolute',
		top: 0,
		left: 0,
	},
	right: {
		position: 'absolute',
		top: 0,
		right: 0,
	},
	middle: {
		position: 'absolute',
		top: 0,
		left: 56,
		right: 56,
	},
	appbar: {
		backgroundColor: Colors.primary,
		height: 56,
		elevation: 4,
	},
	content: {
		backgroundColor: Colors.lightGrey,
		flex: 1,
	},
});

type Props = {
	scene: {
		index: number;
		route: Route;
	};
	routeMapper: Function;
	onNavigate: Function;
	style?: any;
}

export type RouteDescription = {
	title?: string;
	titleComponent?: ReactClass<any>;
	leftComponent?: ReactClass<any>;
	rightComponent?: ReactClass<any>;
	component: ReactClass<any>;
}

export default class Scene extends Component<void, Props, void> {
	static propTypes = {
		scene: PropTypes.shape({
			index: PropTypes.number.isRequired,
			route: PropTypes.object.isRequired,
		}).isRequired,
		onNavigate: PropTypes.func.isRequired,
		routeMapper: PropTypes.func.isRequired,
		style: View.propTypes.style,
	}

	_handleGoBack = () => {
		this.props.onNavigate({
			type: 'pop',
		});
	};

	_renderLeftComponent = (routeDesc: RouteDescription) => {
		const {
			scene,
			onNavigate,
		} = this.props;

		if (routeDesc.leftComponent) {
			const LeftComponent = routeDesc.leftComponent;
			return <LeftComponent onNavigate={onNavigate} {...scene.route.props} />;
		}

		if (scene.index !== 0) {
			return (
				<AppbarTouchable onPress={this._handleGoBack}>
					<AppbarIcon name='arrow-back' />
				</AppbarTouchable>
			);
		}

		return null;
	};

	_renderTitleComponent = (routeDesc: RouteDescription) => {
		const {
			scene,
			onNavigate,
		} = this.props;

		if (routeDesc.titleComponent) {
			const TitleComponent = routeDesc.titleComponent;
			return <TitleComponent onNavigate={onNavigate} {...scene.route.props} />;
		}

		if (routeDesc.title) {
			return <AppbarTitle title={routeDesc.title} />;
		}

		return null;
	};

	_renderRightComponent = (routeDesc: RouteDescription) => {
		const {
			scene,
			onNavigate,
		} = this.props;

		if (routeDesc.rightComponent) {
			const TitleComponent = routeDesc.rightComponent;
			return <TitleComponent onNavigate={onNavigate} {...scene.route.props} />;
		}

		return null;
	};

	_renderScene = () => {
		const {
			route,
		} = this.props.scene;

		const routeDesc = this.props.routeMapper(route);
		const SceneChild = routeDesc.component;

		return (
			<View style={[ styles.container, this.props.style ]}>
				<StatusBar backgroundColor={Colors.primaryDark} />
				{routeDesc.type !== 'modal' ?
					<View style={styles.appbar}>
						<View style={styles.left}>
							{this._renderLeftComponent(routeDesc)}
						</View>
						<View style={styles.middle}>
							{this._renderTitleComponent(routeDesc)}
						</View>
						<View style={styles.right}>
							{this._renderRightComponent(routeDesc)}
						</View>
					</View> :
					null
				}
				<BannerOfflineContainer />
				<SceneChild
					{...route.props}
					style={styles.content}
					onNavigate={this.props.onNavigate}
				/>
			</View>
		);
	};

	render() {
		const {
			route,
		} = this.props.scene;

		const routeDesc = this.props.routeMapper(route);

		return (
			<NavigationCard
				{...this.props}
				style={routeDesc.type === 'modal' ?
					NavigationCard.CardStackStyleInterpolator.forVertical(this.props) :
					undefined
				}
				panHandlers={routeDesc.type === 'modal' ?
					NavigationCard.CardStackPanResponder.forVertical(this.props) :
					undefined
				}
				renderScene={this._renderScene}
			/>
		);
	}
}
