/* @flow */

import React, { Component, PropTypes, Children } from 'react';
import { Animated, StyleSheet } from 'react-native';
import shallowEqual from 'shallowequal';
import ModalHost from './ModalHost';

type Props = {
	visible: boolean;
	animationType: 'fade';
	onRequestClose: Function;
	children?: any;
}

type State = {
	fadeAnim: Animated.Value;
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default class Modal extends Component<void, Props, State> {
	static propTypes = {
		visible: PropTypes.bool.isRequired,
		animationType: PropTypes.oneOf([ 'fade' ]),
		onRequestClose: PropTypes.func.isRequired,
		children: PropTypes.element.isRequired,
	}

	state: State = {
		fadeAnim: new Animated.Value(0),
	};

	componentWillMount() {
		this._renderChild(this.props);
	}

	componentWillReceiveProps(nextProps: Props) {
		this._renderChild(nextProps);
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
	}

	componentWillUnmount() {
		this._updateChild(this.props);
	}

	_handle: ?{ remove: Function; } = null;

	_fadeIn: Function = (cb: Function) => {
		Animated.timing(this.state.fadeAnim, {
			toValue: 1,
			duration: this.props.animationType === 'fade' ? 300 : 0,
		}).start(cb);
	};

	_fadeOut: Function = (cb: Function) => {
		Animated.timing(this.state.fadeAnim, {
			toValue: 0,
			duration: this.props.animationType === 'fade' ? 300 : 0,
		}).start(cb);
	};

	_updateChild: Function = (props, cb) => {
		if (this._handle) {
			this._handle.remove();
			this._handle = null;
		}

		const { visible } = props;

		if (visible) {
			const child = this._getChild(props);
			this._handle = ModalHost.render(child, cb);
		}
	};

	_renderChild: Function = (props) => {
		const { visible } = props;

		if (visible) {
			this._updateChild(props, () => {
				this._fadeIn();
			});
		} else {
			this._fadeOut(() => {
				this._updateChild(props);
			});
		}
	};

	_getChild: Function = ({ visible, children }) => {
		return (
			<Animated.View
				pointerEvents={visible ? 'auto' : 'none'}
				style={[
					styles.container,
					{ opacity: this.state.fadeAnim },
				]}
			>
				{Children.only(children)}
			</Animated.View>
		);
	};

	render() {
		return null;
	}
}
