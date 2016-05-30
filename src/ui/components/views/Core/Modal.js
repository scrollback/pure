/* @flow */

import React, { Component, PropTypes, Children } from 'react';
import { Animated, StyleSheet } from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import ModalHost from './ModalHost';

type Props = {
	visible: boolean;
	animationType: 'fade' | 'none';
	onRequestClose: Function;
	children?: React.Element;
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
		animationType: PropTypes.oneOf([ 'fade', 'none' ]),
		onRequestClose: PropTypes.func.isRequired,
		children: PropTypes.element.isRequired,
	}

	state: State = {
		fadeAnim: new Animated.Value(0),
	};

	componentDidMount() {
		this._renderChild(this.props);
	}

	componentWillReceiveProps(nextProps: Props) {
		this._renderChild(nextProps);
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
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

		const {
			visible,
			onRequestClose,
		} = props;

		if (visible) {
			const element = this._getChild(props);
			this._handle = ModalHost.render({
				element,
				onRequestClose,
			}, cb);
		}
	};

	_renderChild: Function = (props) => {
		const { visible } = props;

		if (visible) {
			this._updateChild(props, () => {
				this._fadeIn();
			});
		} else {
			if (this._handle) {
				this._fadeOut(() => {
					this._updateChild(props);
				});
			}
		}
	};

	_getChild: Function = ({ children }) => {
		return (
			<Animated.View
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
