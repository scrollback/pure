/* @flow */

import React, { Component, PropTypes, Children } from 'react';

type Props = {
	children: React.Element<*>;
}

export default class Container extends Component<void, Props, void> {
	static contextTypes = {
		store: PropTypes.object.isRequired,
	};

	static propTypes = {
		children: PropTypes.element.isRequired,
	};

	render(): React.Element<any> {
		return React.cloneElement(Children.only(this.props.children), { ...this.props, store: this.context.store });
	}
}
