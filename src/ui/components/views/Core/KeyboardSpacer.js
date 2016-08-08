/* @flow */

import React, { PropTypes, Component } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';

const {
	Animated,
	Keyboard,
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

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	componentWillUnmount() {
		this._unRegisterEvents();
	}

	_keyboardDidShowSubscription: { remove: Function };
	_keyboardDidHideSubscription: { remove: Function };

	_registerEvents = () => {
		this._keyboardDidShowSubscription = Keyboard.addListener('keyboardDidShow', e => this._keyboardDidShow(e));
		this._keyboardDidHideSubscription = Keyboard.addListener('keyboardDidHide', e => this._keyboardDidHide(e));
	};

	_unRegisterEvents = () => {
		this._keyboardDidShowSubscription.remove();
		this._keyboardDidHideSubscription.remove();
	};

	_keyboardDidShow = (e: any) => {
		Animated.spring(this.state.keyboardHeightAnim, {
			toValue: e.endCoordinates.height - (this.props.offset || 0),
		}).start();
	};

	_keyboardDidHide = () => {
		Animated.spring(this.state.keyboardHeightAnim, {
			toValue: 0,
		}).start();
	};

	render() {
		return <Animated.View style={{ height: this.state.keyboardHeightAnim }} />;
	}
}
