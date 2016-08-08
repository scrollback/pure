/* @flow */

import React, { Component } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
});

type Options = {
	element: ?React.Element<*>;
	onRequestClose: Function;
}

type State = {
	stack: Array<{
		instance: React.Component<*, *, *>;
		options: Options;
	}>;
}

export default class ModalHost extends Component<void, any, State> {
	static renderModal(instance: React.Component<*, *, *>, options: Options): Promise<void> {
		return new Promise((resolve, reject) => {
			if (ModalHost._pushChild) {
				ModalHost._pushChild(instance, options, resolve);
			} else {
				reject();
			}
		});
	}

	static removeModal(instance: React.Component<*, *, *>): Promise<void> {
		return new Promise((resolve, reject) => {
			if (ModalHost._removeChild) {
				ModalHost._removeChild(instance, resolve);
			} else {
				reject();
			}
		});
	}

	static isModalRendered(instance: React.Component<*, *, *>): boolean {
		if (ModalHost._isChildRendered) {
			return ModalHost._isChildRendered(instance);
		}
		return false;
	}

	static remove(instance: React.Component<*, *, *>): Promise<void> {
		return new Promise((resolve, reject) => {
			if (ModalHost._removeChild) {
				ModalHost._removeChild(instance, resolve);
			} else {
				reject();
			}
		});
	}

	static requestClose() {
		if (ModalHost._requestClose) {
			ModalHost._requestClose();
		}
	}

	static isOpen() {
		if (ModalHost._isOpen) {
			return ModalHost._isOpen();
		}

		return false;
	}

	static _pushChild: ?Function;
	static _removeChild: ?Function;
	static _isChildRendered: ?Function;
	static _requestClose: ?Function;
	static _isOpen: ?Function;

	state: State = {
		stack: [],
	};

	componentDidMount() {
		ModalHost._pushChild = this._pushChild;
		ModalHost._removeChild = this._removeChild;
		ModalHost._isChildRendered = this._isChildRendered;
		ModalHost._requestClose = this._requestClose;
		ModalHost._isOpen = this._isOpen;
	}

	shouldComponentUpdate(nextProps: any, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	componentWillUnmount() {
		ModalHost._pushChild = null;
		ModalHost._removeChild = null;
		ModalHost._isChildRendered = null;
		ModalHost._requestClose = null;
		ModalHost._isOpen = null;
	}

	_pushChild = (instance: React.Component<*, *, *>, options: Options, cb: Function) => {
		this.setState({
			stack: [ ...this.state.stack, { instance, options } ],
		}, cb);
	};

	_removeChild = (instance: React.Component<*, *, *>, cb: Function) => {
		this.setState({
			stack: this.state.stack.filter(op => op.instance !== instance),
		}, cb);
	};

	_isChildRendered = (instance: React.Component<*, *, *>) => {
		const { stack } = this.state;
		for (let i = 0, l = stack.length; i < l; i++) {
			if (stack[i].instance === instance) {
				return true;
			}
		}
		return false;
	};

	_requestClose = () => {
		const { stack } = this.state;

		if (stack.length) {
			stack[stack.length - 1].options.onRequestClose();
		}
	};

	_isOpen = () => {
		return this.state.stack.length > 0;
	};

	render(): ?React.Element<*> {
		const { stack } = this.state;

		if (stack.length === 0) {
			return null;
		}

		return (
			<View style={styles.container}>
				{stack[stack.length - 1].options.element}
			</View>
		);
	}
}
