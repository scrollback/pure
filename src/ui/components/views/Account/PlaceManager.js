/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import PlaceItem from './PlaceItem';
import PlaceButton from './PlaceButton';

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
	onNavigate: Function;
	removePlace: Function;
	places: {
		[key: string]: {
			id: string;
			title: string;
			description: string;
		}
	};
	user: string;
}

export default class PlaceManager extends Component<void, Props, void> {
	static propTypes = {
		onNavigate: PropTypes.func.isRequired,
		removePlace: PropTypes.func.isRequired,
		places: PropTypes.objectOf(PropTypes.object).isRequired,
		user: PropTypes.string.isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handleRemoveLocality = (type: string) => {
		this.props.removePlace(this.props.user, type, this.props.places[type]);
	};

	_handlePress = (type: string) => {
		this.props.onNavigate({
			type: 'push',
			payload: {
				name: 'addplace',
				props: {
					type,
				},
			},
		});
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
