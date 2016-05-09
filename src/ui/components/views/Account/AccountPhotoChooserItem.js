/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import Colors from '../../../Colors';

const {
	StyleSheet,
	View,
	Image,
	TouchableOpacity,
} = ReactNative;

const styles = StyleSheet.create({
	photoContainer: {
		backgroundColor: Colors.placeholder,
		height: 96,
		width: 96,
		borderRadius: 48,
		margin: 8,
	},

	photo: {
		height: 96,
		width: 96,
		borderRadius: 48,
	},
});

type Props = {
	uri: string;
	onPress: Function;
}

export default class AccountPhotoChooserItem extends Component<void, Props, void> {
	static propTypes = {
		uri: PropTypes.string.isRequired,
		onPress: PropTypes.func.isRequired,
	};

	_handlePress: Function = () => {
		this.props.onPress(this.props.uri);
	};

	render() {
		return (
			<TouchableOpacity onPress={this._handlePress}>
				<View style={styles.photoContainer}>
					<Image style={styles.photo} source={{ uri: this.props.uri }} />
				</View>
			</TouchableOpacity>
		);
	}
}
