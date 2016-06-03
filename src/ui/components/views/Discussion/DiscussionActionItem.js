/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import Icon from '../Core/Icon';
import AppText from '../Core/AppText';
import Colors from '../../../Colors';

const {
	StyleSheet,
	TouchableOpacity,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	item: {
		width: 80,
		padding: 8,
		flexDirection: 'row',
		alignItems: 'center',
	},

	label: {
		color: Colors.grey,
		fontWeight: 'bold',
		fontSize: 11,
		lineHeight: 16,
		marginHorizontal: 8,
	},

	icon: {
		color: Colors.grey,
	},
});

type Props = {
	icon: string;
	label: string;
	style?: any;
	iconStyle?: any;
	labelStyle?: any;
}

export default class DiscussionActionItem extends Component<void, Props, void> {
	static propTypes = {
		icon: PropTypes.string.isRequired,
		label: PropTypes.string.isRequired,
		style: View.propTypes.style,
		iconStyle: Icon.propTypes.style,
		labelStyle: AppText.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		return (
			<TouchableOpacity {...this.props}>
				<View style={styles.item}>
					<Icon
						name={this.props.icon}
						style={[ styles.icon, this.props.iconStyle ]}
						size={24}
					/>
					<AppText style={[ styles.label, this.props.labelStyle ]}>{this.props.label}</AppText>
				</View>
			</TouchableOpacity>
		);
	}
}
