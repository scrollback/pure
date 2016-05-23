/* @flow */

import React, { Component } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';

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

type State = {
	elements: Array<Element>;
}

export default class ModalHost extends Component<void, any, State> {
	static render(element, callback) {
		if (ModalHost._pushChild) {
			ModalHost._pushChild(element, callback);

			return {
				remove: (cb) => {
					if (ModalHost._removeChild) {
						ModalHost._removeChild(element, cb);
					}
				},
			};
		}

		return null;
	}

	static _pushChild: ?Function;
	static _removeChild: ?Function;

	state: State = {
		elements: [],
	};

	componentDidMount() {
		ModalHost._pushChild = this._pushChild;
		ModalHost._removeChild = this._removeChild;
	}

	shouldComponentUpdate(nextProps: any, nextState: State): boolean {
		return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
	}

	componentWillUnmount() {
		ModalHost._pushChild = null;
		ModalHost._removeChild = null;
	}

	_elements: Array<Element>;

	_pushChild: Function = (element, cb) => {
		this.setState({
			elements: [ ...this.state.elements, element ],
		}, cb);
	};

	_removeChild: Function = (element, cb) => {
		const { elements } = this.state;
		const newlist = [];

		for (const el of elements) {
			if (el !== element) {
				newlist.push(el);
			}
		}

		this.setState({
			elements: newlist,
		}, cb);
	};

	render(): ?React.Element {
		const { elements } = this.state;

		if (elements.length === 0) {
			return null;
		}

		return (
			<View style={styles.container}>
				{elements[elements.length - 1]}
			</View>
		);
	}
}
