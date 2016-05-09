/* @flow */

import React, { PropTypes, Component } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import PersistentNavigator from '../../navigation/PersistentNavigator';
import StatusbarWrapper from './StatusbarWrapper';
import KeyboardSpacer from './KeyboardSpacer';
import Modal from './Modal';
import UserSwitcherContainer from '../containers/UserSwitcherContainer';
import NavigationState from '../../navigation-rfc/Navigation/NavigationState';
import VersionCodes from '../../modules/VersionCodes';
import Colors from '../../Colors';
import { convertRouteToState, convertURLToState } from '../../../lib/Route';

const {
	StyleSheet,
	Platform,
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
	statusbar: {
		backgroundColor: Colors.primary,
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
					<StatusbarWrapper style={styles.statusbar} />
					<PersistentNavigator
						initialState={new NavigationState(routes, index)}
						persistenceKey={initialURL ? null : PERSISTANCE_KEY}
					/>

					{Platform.Version >= VersionCodes.KITKAT ?
						<KeyboardSpacer /> :
						null // Android seems to Pan the screen on < Kitkat
					}
				</View>
				<Modal />
			</View>
		);
	}
}
