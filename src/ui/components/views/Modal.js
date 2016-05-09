/* @flow */

import React, { Component } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import Colors from '../../Colors';
import AppText from './AppText';
import ModalSheet from './ModalSheet';
import TouchFeedback from './TouchFeedback';
import KeyboardSpacer from './KeyboardSpacer';
import VersionCodes from '../../modules/VersionCodes';

const {
	StyleSheet,
	Platform,
	Dimensions,
	TouchableWithoutFeedback,
	Animated,
	PixelRatio,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: 'absolute',
		top: 0,
		left: 0,
	},
	overlay: {
		flex: 1,
		alignItems: 'stretch',
		justifyContent: 'flex-end',
		backgroundColor: Colors.fadedBlack,
	},
	menuItem: {
		borderColor: Colors.separator,
		borderTopWidth: 1 / PixelRatio.get(),
	},
	menuItemFirst: {
		borderTopWidth: 0,
	},
	menuItemText: {
		fontSize: 16,
		lineHeight: 24,
		color: Colors.darkGrey,
		margin: 20,
		paddingHorizontal: 4,
	},
});

type State = {
	element: ?Element;
	fadeAnim: ?Animated.Value
}

export default class Modal extends Component<void, any, State> {
	static isShown() {
		if (Modal._isShown) {
			return Modal._isShown();
		}

		return false;
	}

	static renderChild(element) {
		if (Modal._renderChild) {
			Modal._renderChild(element);

			return true;
		}

		return false;
	}

	static renderModal(element) {
		return Modal.renderChild(

			/* $FlowFixMe: Not sure what's happening here */
			<TouchableWithoutFeedback onPress={() => Modal.renderChild(null)}>
				<View style={styles.overlay}>
					<ModalSheet>
						{element}
					</ModalSheet>

					<KeyboardSpacer />
				</View>
			</TouchableWithoutFeedback>
		);
	}

	static showActionSheetWithItems(items, callback) {
		const options = [];
		const actions = [];

		for (const k in items) {
			options.push(k);
			actions.push(items[k]);
		}

		Modal.showActionSheetWithOptions({ options }, index => actions[index](), callback);
	}

	static showActionSheetWithOptions = (options, callback) => {
		return Modal.renderModal(options.options.map((item, index) => (
			<TouchFeedback
				key={index}
				onPress={() =>
					global.requestAnimationFrame(() => {
						callback(index);

						Modal.renderChild(null);
					}
				)}
			>
				<View style={[ styles.menuItem, index === 0 ? styles.menuItemFirst : null ]}>
					<AppText style={styles.menuItemText}>{item}</AppText>
				</View>
			</TouchFeedback>
		)));
	};

	static _renderChild: ?Function;
	static _isShown: ?Function;

	state: State = {
		element: null,
		fadeAnim: null,
	};

	componentDidMount() {
		Modal._renderChild = this._renderChild;
		Modal._isShown = this._isShown;
	}

	shouldComponentUpdate(nextProps: any, nextState: State): boolean {
		return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
	}

	componentWillUnmount() {
		Modal._renderChild = null;
		Modal._isShown = null;
	}

	_element: ?Element;

	_renderChild: Function = element => {
		if (element === this._element) {
			return;
		}

		this._element = element;

		if (element) {
			this.setState({
				element,
				fadeAnim: new Animated.Value(0),
			}, () => Animated.timing(this.state.fadeAnim, {
				toValue: 1,
				duration: 300,
			}).start());
		} else if (this.state.element) {
			Animated.timing(this.state.fadeAnim, {
				toValue: 0,
				duration: 300,
			}).start(() => this.setState({ element: null }));
		}
	};

	_isShown: Function = () => {
		return !!this.state.element;
	};

	render(): ?React.Element {
		if (!this.state.element) {
			return null;
		}

		let { height, width } = Dimensions.get('window');

		// Android < 4.4 seems to include statusbar height also
		if (Platform.OS === 'android' && Platform.Version < VersionCodes.KITKAT) {
			height -= 25;
			width -= 0;
		}

		return (
			<Animated.View style={[ styles.container, { height, width, opacity: this.state.fadeAnim } ]}>
				{this.state.element}
			</Animated.View>
		);
	}
}
