/*
 * Helper component to provide the store to child components
 *
 * Usage: <Provider store={store}><RootComponent /></Provider>
 *
 * @flow
 */

import React, { Component, Children, PropTypes } from 'react';
import type { EnhancedStore } from './storeTypeDefinitions';

type Props = {
	children?: React.Element<*>;
	store: EnhancedStore;
}

export default class Provider extends Component<void, Props, void> {
	static propTypes = {
		children: PropTypes.element.isRequired,
		store: PropTypes.object.isRequired,
	};

	static childContextTypes = {
		store: PropTypes.object.isRequired,
	};

	getChildContext(): Object {
		return {
			store: this.props.store,
		};
	}

	render(): any {
		return Children.only(this.props.children);
	}
}
