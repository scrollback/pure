/* @flow */

import './Client-base';
import React, { Component } from 'react';
import ReactNative from 'react-native';
import AppContainer from './components/containers/AppContainer';
import Provider from '../modules/store/Provider';
import store from '../modules/store/store';

const {
	AppRegistry,
} = ReactNative;

export default class Belong extends Component {
	render() {
		return (
			<Provider store={store}>
				<AppContainer />
			</Provider>
		);
	}
}

AppRegistry.registerComponent('Belong', () => Belong);
