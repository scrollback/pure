/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import AppText from './AppText';
import Colors from '../../Colors';

const {
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	title: {
		fontWeight: 'bold',
		color: Colors.black,
	},
});

type Props = {
	title: ?string;
	style?: any;
}

export default class EmbedTitle extends Component<void, Props, void> {
	static propTypes = {
		title: PropTypes.string,
		style: AppText.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		if (this.props.title) {
			return (
				<AppText
					numberOfLines={1}
					{...this.props}
					style={[ styles.title, this.props.style ]}
				>
					{this.props.title}
				</AppText>
			);
		} else {
			return null;
		}
	}
}
