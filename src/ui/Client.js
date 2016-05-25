/* @flow */

import './Client-base';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { StyleRoot } from 'radium';
import AppContainer from './components/containers/AppContainer';
import Provider from '../modules/store/Provider';
import store from '../modules/store/store';

export default class Belong extends Component {
	render() {
		return (
			<StyleRoot>
				<Provider store={store}>
					<AppContainer />
				</Provider>
			</StyleRoot>
		);
	}
}

ReactDOM.render(<Belong />, document.getElementById('root'));
