/* @flow */

import React, { PropTypes, Component } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import PersistentNavigator from '../../navigation/PersistentNavigator';
import UserSwitcherContainer from '../containers/UserSwitcherContainer';
import NavigationState from '../../navigation-rfc/Navigation/NavigationState';
import Colors from '../../Colors';
import { convertRouteToState, convertURLToState } from '../../../lib/Route';

const {
	StatusBar,
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		flex: 1,
	},
	inner: {
		flex: 1,
	},
});

const PERSISTANCE_KEY = __DEV__ ? 'FLAT_PERSISTENCE_0' : null;

type Props = {
	initialURL: ?string
};

export default class Home extends Component<void, Props, void> {
	static propTypes = {
		initialURL: PropTypes.string,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		const { initialURL } = this.props;
		const { index, routes } = initialURL ? convertURLToState(initialURL) : convertRouteToState({ name: 'home' });

		return (
			<View style={styles.container}>
				<UserSwitcherContainer />
				<View style={styles.inner}>
					<StatusBar backgroundColor={Colors.primaryDark} />
					<PersistentNavigator
						initialState={new NavigationState(routes, index)}
						persistenceKey={initialURL ? null : PERSISTANCE_KEY}
					/>
				</View>
			</View>
		);
	}
}
