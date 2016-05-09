/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import AppText from './AppText';
import AppTextInput from './AppTextInput';

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	phantom: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		opacity: 0,
	},
});

type Props = {
	value?: string;
	defaultValue?: string;
	numberOfLines?: number;
	placeholder?: string;
	inputStyle?: any;
	style?: any;
	onChange?: Function;
	onValueChange?: Function;
}

type State = {
	value: string;
}

export default class GrowingTextInput extends Component<void, Props, State> {
	static propTypes = {
		value: PropTypes.string,
		defaultValue: PropTypes.string,
		placeholder: PropTypes.string,
		numberOfLines: PropTypes.number,
		onChange: PropTypes.func,
		onValueChange: PropTypes.func,
		inputStyle: AppTextInput.propTypes.style,
		style: View.propTypes.style,
	};

	state: State = {
		value: '',
		height: 58,
	};

	componentWillMount() {
		this.setState({
			value: this.props.value || this.props.defaultValue || '',
		});
	}

	componentWillReceiveProps(nextProps: Props) {
		this.setState({
			value: nextProps.value,
		});
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
	}

	_input: Object;

	_handleChange: Function = e => {
		if (this.props.onChange) {
			this.props.onChange(e);
		}

		const value = e.nativeEvent.text;

		if (this.props.onValueChange) {
			this.props.onValueChange(value);
		}

		this.setState({ value });
	};

	_handleLayout: Function = e => {
		this._input.setNativeProps({ height: e.nativeEvent.layout.height });
	};

	focus: Function = (...args) => {
		this._input.focus(...args);
	};

	blur: Function = (...args) => {
		this._input.blur(...args);
	};

	focusKeyboard: Function = () => {
		// Need to blur first to trigger showing keyboard
		this._input.blur();

		// Add a timeout so that blur() and focus() are not batched at the same time
		setTimeout(() => this._input.focus(), 50);
	};

	render() {
		return (
			<View style={this.props.style}>
				<AppText
					numberOfLines={this.props.numberOfLines}
					style={[ this.props.inputStyle, styles.phantom ]}
					onLayout={this._handleLayout}
					pointerEvents='none'
				>
					{(this.state.value || this.props.placeholder || '') + '\n'}
				</AppText>
				<AppTextInput
					{...this.props}
					ref={c => (this._input = c)}
					value={this.state.value}
					onChange={this._handleChange}
					style={this.props.inputStyle}
					multiline
				/>
			</View>
		);
	}
}
