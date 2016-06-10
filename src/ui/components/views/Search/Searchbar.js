/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppTextInput from '../Core/AppTextInput';
import AppbarSecondary from '../Appbar/AppbarSecondary';
import AppbarTouchable from '../Appbar/AppbarTouchable';
import AppbarIcon from '../Appbar/AppbarIcon';
import Colors from '../../../Colors';

const {
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	input: {
		flex: 1,
		fontSize: 16,
		color: Colors.black,
		backgroundColor: 'transparent',
	},
	icon: {
		color: Colors.fadedBlack,
	},
});

type Props = {
	onChangeSearch: Function;
	onFocus?: Function;
	onBlur?: Function;
	onCancel?: ?Function;
	placeholder?: string;
	autoFocus?: boolean;
}

type State = {
	query: string;
}

export default class SearchBar extends Component<void, Props, State> {
	static propTypes = {
		onChangeSearch: PropTypes.func.isRequired,
		onFocus: PropTypes.func,
		onBlur: PropTypes.func,
		onCancel: PropTypes.func,
		placeholder: PropTypes.string,
		autoFocus: PropTypes.bool,
	};

	state: State = {
		query: '',
	};

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handleChange = (query: string) => {
		this.setState({
			query,
		});

		this.props.onChangeSearch(query);
	};

	_handleClearInput = () => {
		this.setState({
			query: '',
		});

		this.props.onChangeSearch('');
	};

	render() {
		return (
			<AppbarSecondary {...this.props}>
				{this.props.onCancel ?
					<AppbarTouchable type='secondary' onPress={this.props.onCancel}>
						<AppbarIcon name='arrow-back' style={styles.icon} />
					</AppbarTouchable> :
					<AppbarIcon name='search' style={styles.icon} />
				}

				<AppTextInput
					value={this.state.query}
					autoFocus={this.props.autoFocus}
					onChangeText={this._handleChange}
					placeholder={this.props.placeholder}
					placeholderTextColor='rgba(0, 0, 0, 0.5)'
					onFocus={this.props.onFocus}
					onBlur={this.props.onBlur}
					style={styles.input}
				/>

				{this.state.query ?
					<AppbarTouchable type='secondary' onPress={this._handleClearInput}>
						<AppbarIcon name='close' style={styles.icon} />
					</AppbarTouchable> :
					null
				}
			</AppbarSecondary>
		);
	}
}
