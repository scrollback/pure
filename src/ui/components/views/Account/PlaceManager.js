/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import PlacesSelectorContainer from '../../containers/PlaceSelectorContainer';
import PlaceItem from './PlaceItem';
import PlaceButton from './PlaceButton';
import PlacesSelectorTip from './PlacesSelectorTip';
import Modal from '../Modal';

const {
	View,
	InteractionManager,
} = ReactNative;

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
	onPlaceAdded: Function;
	onPlaceRemoved: Function;
	places: {
		[key: string]: {
			id: string;
			title: string;
			description: string;
		}
	}
}

export default class PlaceManager extends Component<void, Props, void> {
	static propTypes = {
		onPlaceAdded: PropTypes.func.isRequired,
		onPlaceRemoved: PropTypes.func.isRequired,
		places: PropTypes.objectOf(PropTypes.object).isRequired,
	};

	_handleDismissModal: Function = () => {
		Modal.renderChild(null);
	};

	_handleSelectItem: Function = (type: string, place) => {
		this._handleDismissModal();

		InteractionManager.runAfterInteractions(() => {
			this.props.onPlaceAdded(type, {
				id: place.placeId,
				title: place.primaryText || '',
				description: place.secondaryText || '',
			});
		});
	};

	_handleRemoveLocality: Function = (type: string) => {
		this.props.onPlaceRemoved(type, this.props.places[type]);
	};

	_handlePress: Function = type => {
		Modal.renderChild(
			<PlacesSelectorContainer
				onCancel={this._handleDismissModal}
				onSelectPlace={place => this._handleSelectItem(type, place)}
				renderBlankslate={() => <PlacesSelectorTip type={type} />}
				searchHint={TYPES.filter(c => c.type === type)[0].search}
			/>
		);
	};

	render() {
		const { places } = this.props;

		return (
			<View {...this.props}>
				{TYPES.map(item => {
					if (places[item.type]) {
						return (
							<PlaceItem
								key={item.type}
								type={item.type}
								place={places[item.type]}
								onRemove={this._handleRemoveLocality}
							/>
						);
					}

					return (
						<PlaceButton
							key={item.type}
							type={item.type}
							label={item.label}
							hint={item.hint}
							onPress={this._handlePress}
						/>
					);
				})}
			</View>
		);
	}
}
