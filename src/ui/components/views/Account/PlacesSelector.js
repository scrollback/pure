/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import LocationItem from './LocationItem';
import PoweredByGoogle from './PoweredByGoogle';
import SearchableList from '../SearchableList';
import KeyboardSpacer from '../KeyboardSpacer';
import Colors from '../../../Colors';
import GooglePlaces from '../../../modules/GooglePlaces';

const {
	StatusBar,
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.lightGrey,
	},

	poweredBy: {
		borderTopColor: Colors.separator,
		borderTopWidth: StyleSheet.hairlineWidth,
		alignSelf: 'stretch',
	},
});

type Props = {
	location: {
		latitude: number;
		longitude: number;
	};
	onSelectPlace: Function;
	onCancel?: Function;
	renderBlankslate?: Function;
	searchHint: string;
}

export default class PlacesSelector extends Component<void, Props, void> {
	static propTypes = {
		location: PropTypes.shape({
			latitude: PropTypes.number,
			longitude: PropTypes.number,
		}),
		onSelectPlace: PropTypes.func.isRequired,
		onCancel: PropTypes.func,
		renderBlankslate: PropTypes.func,
		searchHint: PropTypes.string.isRequired,
	};

	_getResults: Function = (query: string) => GooglePlaces.getAutoCompletePredictions(
		query, [ this.props.location ], []
	);

	_renderRow: Function = place => <LocationItem place={place} onPress={() => this.props.onSelectPlace(place)} />;

	render() {
		return (
			<View style={styles.container}>
				<StatusBar backgroundColor={Colors.grey} />
				<SearchableList
					getResults={this._getResults}
					renderRow={this._renderRow}
					renderBlankslate={this.props.renderBlankslate}
					onCancel={this.props.onCancel}
					searchHint={this.props.searchHint}
				/>
				<KeyboardSpacer offset={36} />
				<PoweredByGoogle style={styles.poweredBy} />
			</View>
		);
	}
}
