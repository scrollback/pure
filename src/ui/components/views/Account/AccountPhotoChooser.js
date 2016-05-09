/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import AccountPhotoChooserItem from './AccountPhotoChooserItem';

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		padding: 8,
	},
});

type Props = {
	photos: Array<string>;
	onSelect: Function;
}

export default class AccountPhotoChooser extends Component<void, Props, void> {
	static propTypes = {
		photos: PropTypes.arrayOf(PropTypes.string).isRequired,
		onSelect: PropTypes.func.isRequired,
	};

	render() {
		const { photos } = this.props;

		return (
			<View style={styles.container}>
				{photos.filter((uri, i) => photos.indexOf(uri) === i).slice(0, 9).map(uri => (
					<AccountPhotoChooserItem
						key={uri}
						uri={uri}
						onPress={this.props.onSelect}
					/>
				))}
			</View>
		);
	}
}
