/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import AppText from '../AppText';
import RichText from '../RichText';
import Icon from '../Icon';
import Colors from '../../../Colors';

const {
	StyleSheet,
	TouchableOpacity,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	info: {
		padding: 8,
	},

	button: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 4,
	},

	icon: {
		color: Colors.info,
	},

	action: {
		color: Colors.info,
		fontSize: 12,
		lineHeight: 18,
		fontWeight: 'bold',
		marginHorizontal: 8,
	},

	header: {
		color: Colors.fadedBlack,
		fontWeight: 'bold',
		fontSize: 12,
		lineHeight: 18,
	},

	text: {
		color: Colors.darkGrey,
		fontSize: 14,
		lineHeight: 21,
		marginVertical: 4,
	},
});

type Props = {
	action?: ?string;
	header: string;
	value: ?string;
	onEdit: Function;
}

export default class Profile extends Component<void, Props, void> {
	static propTypes = {
		action: PropTypes.string,
		header: PropTypes.string.isRequired,
		value: PropTypes.string,
		onEdit: PropTypes.func.isRequired,
	};

	render() {
		const {
			action,
			header,
			value,
			onEdit,
		} = this.props;

		if (!(value || action)) {
			return null;
		}

		return (
			<View style={styles.info}>
				<AppText style={styles.header}>{header.toUpperCase()}</AppText>
				{value ?
					<RichText text={value} style={styles.text} /> :
						<TouchableOpacity style={styles.button} onPress={onEdit}>
							<Icon
								style={styles.icon}
								name='add-circle'
								size={12}
							/>
							<AppText style={styles.action}>{action}</AppText>
						</TouchableOpacity>
				}
			</View>
		);
	}
}
