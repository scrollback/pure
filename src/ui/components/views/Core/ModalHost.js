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
		flex: 1,
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
});

type Options = {
	element: React.Element;
	onRequestClose: Function;
}

type State = {
	stack: Array<Options>;
}

export default class ModalHost extends Component<void, any, State> {
	static render(options: Options, callback: Function) {
		if (ModalHost._pushChild) {
			ModalHost._pushChild(options, callback);

			return {
				remove: (cb) => {
					if (ModalHost._removeChild) {
						ModalHost._removeChild(options, cb);
					}
				},
			};
		}

		return null;
	}

	static requestClose() {
		if (this._requestClose) {
			this._requestClose();
		}
	}

	static isOpen() {
		if (this._isOpen) {
			return this._isOpen();
		}

		return false;
	}

	static _pushChild: ?Function;
	static _removeChild: ?Function;
	static _requestClose: ?Function;
	static _isOpen: ?Function;

	state: State = {
		stack: [],
	};

	componentDidMount() {
		ModalHost._pushChild = this._pushChild;
		ModalHost._removeChild = this._removeChild;
		ModalHost._requestClose = this._requestClose;
		ModalHost._isOpen = this._isOpen;
	}

	shouldComponentUpdate(nextProps: any, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	componentWillUnmount() {
		ModalHost._pushChild = null;
		ModalHost._removeChild = null;
		ModalHost._requestClose = null;
		ModalHost._isOpen = null;
	}

	_pushChild: Function = (options, cb) => {
		this.setState({
			stack: [ ...this.state.stack, options ],
		}, cb);
	};

	_removeChild: Function = (options, cb) => {
		const { stack } = this.state;
		const newstack = [];

		for (const op of stack) {
			if (op !== options) {
				newstack.push(op);
			}
		}

		this.setState({
			stack: newstack,
		}, cb);
	};

	_requestClose: Function = () => {
		const { stack } = this.state;

		if (stack.length) {
			stack[stack.length - 1].onRequestClose();
		}
	};

	_isOpen: Function = () => {
		return this.state.stack.length > 0;
	};

	render(): ?React.Element {
		const { stack } = this.state;

		if (stack.length === 0) {
			return null;
		}

		return (
			<View style={styles.container}>
				{stack[stack.length - 1].element}
			</View>
		);
	}
}
