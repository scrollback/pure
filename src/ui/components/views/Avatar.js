/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';

const {
	Image,
} = ReactNative;

type Props = {
	uri: ?string;
}

export default class Avatar extends Component<void, Props, void> {
	static propTypes = {
		uri: PropTypes.string,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		if (this.props.uri) {
			return <Image {...this.props} source={{ uri: this.props.uri }} />;
		} else {
			return null;
		}
	}
}
