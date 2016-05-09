/* @flow */

import React, { PropTypes, Component } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';

const {
	Animated,
	View,
	DeviceEventEmitter,
} = ReactNative;

type Props = {
	offset?: number;
}

type State = {
	keyboardHeightAnim: Animated.Value
}

export default class KeyboardSpacer extends Component<Props, Props, State> {
	static propTypes = {
		offset: PropTypes.number,
	};

	static defaultProps = {
		offset: 0,
	};

	state: State = {
		keyboardHeightAnim: new Animated.Value(0),
	};

	componentWillMount() {
		this._registerEvents();
	}

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	componentWillUnmount() {
		this._unRegisterEvents();
	}

	_keyboardDidShowSubscription: { remove: Function };
	_keyboardDidHideSubscription: { remove: Function };

	_registerEvents: Function = () => {
		this._keyboardDidShowSubscription = DeviceEventEmitter.addListener('keyboardDidShow', e => this._keyboardDidShow(e));
		this._keyboardDidHideSubscription = DeviceEventEmitter.addListener('keyboardDidHide', e => this._keyboardDidHide(e));
	};

	_unRegisterEvents: Function = () => {
		this._keyboardDidShowSubscription.remove();
		this._keyboardDidHideSubscription.remove();
	};

	_keyboardDidShow: Function = e => {
		Animated.spring(this.state.keyboardHeightAnim, {
			toValue: e.endCoordinates.height - (this.props.offset || 0),
		}).start();
	};

	_keyboardDidHide: Function = () => {
		Animated.spring(this.state.keyboardHeightAnim, {
			toValue: 0,
		}).start();
	};

	render(): React.Element {
		return <Animated.View style={{ height: this.state.keyboardHeightAnim }} />;
	}
}
