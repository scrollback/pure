/* @flow */

import React, { Component, PropTypes } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import ModalHost from './ModalHost';

type Props = {
	visible: boolean;
	animationType: 'fade' | 'none';
	onRequestClose: Function;
	children?: React.Element<*>;
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

	_animate = (anim: Animated.Value, toValue: number) => {
		return new Promise(resolve => {
			Animated.timing(anim, {
				toValue,
				duration: 250,
			}).start(resolve);
		});
	};

	_fadeIn = () => {
		return this._animate(this.state.fadeAnim, 1);
	};

	_fadeOut = () => {
		return this._animate(this.state.fadeAnim, 0);
	};

	_updateChild = async (props: Props) => {
		await ModalHost.removeModal(this);

		const {
			visible,
			onRequestClose,
		} = props;

		if (visible) {
			const element = this._getChild(props);
			await ModalHost.renderModal(this, {
				element,
				onRequestClose,
			});
		}
	};

	_renderChild = async (props: Props) => {
		const { visible, animationType } = props;

		if (visible) {
			await this._updateChild(props);
			switch (animationType) {
			case 'fade':
				await this._fadeIn();
				break;
			}
		} else {
			if (ModalHost.isModalRendered(this)) {
				switch (animationType) {
				case 'fade':
					await this._fadeOut();
					await this._updateChild(props);
					break;
				default:
					await this._updateChild(props);
				}
			}
		}
	};

	_getChild = ({ children, animationType, visible }: Props) => {
		switch (animationType) {
		case 'fade':
			return (
				<Animated.View style={[ styles.container, { opacity: this.state.fadeAnim } ]}>
					{children}
				</Animated.View>
			);
		default:
			if (visible) {
				return (
					<View style={styles.container}>
						{children}
					</View>
				);
			} else {
				return null;
			}
		}
	};

	render() {
		return null;
	}
}
