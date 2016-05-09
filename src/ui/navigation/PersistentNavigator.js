/* @flow */

import React, { PropTypes } from 'react';
import renderNavigator from './renderNavigator';
import NavigationContainer from '../navigation-rfc/Navigation/NavigationContainer';
import NavigationState from '../navigation-rfc/Navigation/NavigationState';

const stateToString = (navState) => {
	return JSON.stringify({
		index: navState.index,
		routes: navState.toArray().map(JSON.stringify),
	});
};

const stringToState = (navString) => {
	const { routes, index } = JSON.parse(navString);

	return new NavigationState(routes.map(JSON.parse), index);
};

const PersistentNavigator = (props: Object): Element => (
	<NavigationContainer.RootContainer
		initialState={props.initialState}
		persistenceKey={props.persistenceKey}
		stateToString={stateToString}
		stringToState={stringToState}
		renderNavigator={renderNavigator(props)}
	/>
);

PersistentNavigator.propTypes = {
	initialState: PropTypes.any.isRequired,
	persistenceKey: PropTypes.string,
};

export default PersistentNavigator;
