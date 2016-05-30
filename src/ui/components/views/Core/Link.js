/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from './AppText';
import Colors from '../../../Colors';

const {
	Linking,
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	link: {
		color: Colors.info,
	},
});

type Props = {
	children?: React.Element;
	url?: string;
	onPress?: Function;
	onOpen?: Function;
	style?: any;
}

type DefaultProps = {
	url: string;
}

export default class Link extends Component<DefaultProps, Props, void> {
	static defaultProps = {
		url: '#',
	};

	static propTypes = {
		children: PropTypes.string.isRequired,
		url: PropTypes.string,
		onPress: PropTypes.func,
		onOpen: PropTypes.func,
		style: AppText.propTypes.style,
	};

	shouldComponentUpdate(nextProps: any, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_openLink: Function = url => {
		const event = {
			preventDefault() {
				this.defaultPrevented = true;
			},

			defaultPrevented: false,
			url,
		};

		if (this.props.onOpen) {
			this.props.onOpen(event);
		}

		if (/^#/.test(url)) {
			return;
		}

		if (!event.defaultPrevented) {
			Linking.openURL(url);
		}
	};

	_handlePress: Function = e => {
		if (this.props.onPress) {
			this.props.onPress(e);
		}

		this._openLink(this.props.url);
	};

	render() {
		return (
			<AppText
				{...this.props}
				onPress={this._handlePress}
				style={[ styles.link, this.props.style ]}
			>
				{this.props.children}
			</AppText>
		);
	}
}
