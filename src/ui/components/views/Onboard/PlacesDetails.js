/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import PlaceSelectorTip from '../Account/PlaceSelectorTip';
import PlaceSearchContainer from '../../containers/PlaceSearchContainer';
import LocationListener from '../../../modules/LocationListener';

type Place = {
	fullText: string;
	primaryText: string;
	secondaryText: string;
	placeId: string;
	placeTypes: Array<number>;
}

type Props = {
	onChangeField: Function;
	submitPlaceDetails: Function;
}

const {
	InteractionManager,
} = ReactNative;

export default class PlacesDetails extends Component<void, Props, void> {
	static propTypes = {
		onChangeField: PropTypes.func.isRequired,
		submitPlaceDetails: PropTypes.func.isRequired,
	};

	componentDidMount() {
		InteractionManager.runAfterInteractions(() => LocationListener.requestEnableLocation({ priority: 'high_accuracy' }));
	}

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handleSelectPlace = (place: Place) => {
		this.props.onChangeField('places', { home: place });

		setTimeout(() => this.props.submitPlaceDetails(), 100);
	};

	_renderBlankslate = () => <PlaceSelectorTip type='home' />;

	render() {
		return (
			<PlaceSearchContainer
				renderBlankslate={this._renderBlankslate}
				onSelectPlace={this._handleSelectPlace}
				searchHint='Search for your apartment'
			/>
		);
	}
}
