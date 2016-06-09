/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import PlaceSearchContainer from '../../containers/PlaceSearchContainer';
import PlaceSelectorTip from './PlaceSelectorTip';

const TYPES = [
	{
		type: 'home',
		title: 'Home',
		label: 'Add where you live',
		search: 'Search for your apartment',
		hint: 'Join your neighborhood group',
	},
	{
		type: 'work',
		title: 'Work',
		label: 'Add where you work or study',
		search: 'Search for your office or college',
		hint: 'Join your office or campus group',
	},
	{
		type: 'hometown',
		title: 'Hometown',
		label: 'Add your hometown',
		search: 'Search for your hometown',
		hint: 'Join people from your hometown in the city',
	},
];

type Props = {
	onNavigate: Function;
	addPlace: Function;
	user: string;
	type: 'home' | 'work' | 'hometown';
}

type Place = {
	placeId: string;
	primaryText?: string;
	secondaryText?: string;
}

export default class PlaceManagerSelector extends Component<void, Props, void> {
	static propTypes = {
		onNavigate: PropTypes.func.isRequired,
		addPlace: PropTypes.func.isRequired,
		user: PropTypes.string.isRequired,
		type: PropTypes.oneOf([ 'home', 'work', 'hometown' ]).isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handleGoBack = () => {
		this.props.onNavigate({
			type: 'pop',
		});
	};

	_handleSelectItem = (place: Place) => {
		this.props.addPlace(this.props.user, this.props.type, {
			id: place.placeId,
			title: place.primaryText || '',
			description: place.secondaryText || '',
		});
		this._handleGoBack();
	};

	_renderBlankSlate = () => {
		const { type } = this.props;

		if (type) {
			return <PlaceSelectorTip type={type} />;
		}

		return null;
	};

	_getSearchHint = () => {
		const types = TYPES.filter(c => c.type === this.props.type);

		if (types && types.length) {
			return types[0].search;
		}

		return null;
	};

	render() {
		return (
			<PlaceSearchContainer
				onCancel={this._handleGoBack}
				onSelectPlace={this._handleSelectItem}
				renderBlankslate={this._renderBlankSlate}
				searchHint={this._getSearchHint()}
			/>
		);
	}
}
