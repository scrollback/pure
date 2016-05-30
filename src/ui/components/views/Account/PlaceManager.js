/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import PlacesSelectorContainer from '../../containers/PlaceSelectorContainer';
import PlaceItem from './PlaceItem';
import PlaceButton from './PlaceButton';
import PlacesSelectorTip from './PlacesSelectorTip';
import Modal from '../Core/Modal';

const {
	View,
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

type State = {
	currentType: ?'home' | 'work' | 'hometown';
}

export default class PlaceManager extends Component<void, Props, State> {
	static propTypes = {
		onPlaceAdded: PropTypes.func.isRequired,
		onPlaceRemoved: PropTypes.func.isRequired,
		places: PropTypes.objectOf(PropTypes.object).isRequired,
	};

	state: State = {
		currentType: null,
	};

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handleRequestClose: Function = () => {
		this.setState({
			currentType: null,
		});
	};

	_handleSelectItem: Function = (place) => {
		this.props.onPlaceAdded(this.state.currentType, {
			id: place.placeId,
			title: place.primaryText || '',
			description: place.secondaryText || '',
		});
		this._handleRequestClose();
	};

	_handleRemoveLocality: Function = (type: string) => {
		this.props.onPlaceRemoved(type, this.props.places[type]);
	};

	_handlePress: Function = currentType => {
		this.setState({
			currentType,
		});
	};

	_renderBlankSlate: Function = () => {
		const type = this.state.currentType;

		if (type) {
			return <PlacesSelectorTip type={type} />;
		}

		return null;
	};

	_getSearchHint: Function = () => {
		const types = TYPES.filter(c => c.type === this.state.currentType);

		if (types && types.length) {
			return types[0].search;
		}

		return null;
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

				<Modal
					visible={!!this.state.currentType}
					animationType='fade'
					onRequestClose={this._handleRequestClose}
				>
					<PlacesSelectorContainer
						onCancel={this._handleRequestClose}
						onSelectPlace={this._handleSelectItem}
						renderBlankslate={this._renderBlankSlate}
						searchHint={this._getSearchHint()}
					/>
				</Modal>
			</View>
		);
	}
}
