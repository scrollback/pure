/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowEqual from 'shallowequal';
import RoomListContainer from '../../containers/RoomListContainer';
import RoomsFooterContainer from '../../containers/RoomsFooterContainer';
import SearchableList from '../SearchableList';
import RoomItem from './RoomItem';
import NavigationActions from '../../../navigation-rfc/Navigation/NavigationActions';

type Props = {
	data: Array<{ id: string; name: string; }>;
	onNavigation: Function;
}

export default class RoomListForModeration extends Component<void, Props, void> {
	static propTypes = {
		data: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
		})).isRequired,
		onNavigation: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	_handleSelectLocality: Function = room => {
		this.props.onNavigation(new NavigationActions.Push({
			name: 'room',
			props: {
				room: room.id,
			},
		}));
	};

	_renderRow: Function = room => {
		return (
			<RoomItem
				key={room.id}
				room={room}
				onSelect={this._handleSelectLocality}
			/>
		);
	};

	_renderFooter: Function = () => {
		return <RoomsFooterContainer onNavigation={this.props.onNavigation} />;
	};

	_getResults: Function = (filter: string) => {
		const query = filter.toLowerCase();

		return this.props.data
			.filter(room => room.name.toLowerCase().indexOf(query) > -1)
			.sort((a, b) => {
				let isA, isB;

				if (a.name.toLowerCase().indexOf(query) === 0) {
					isA = true;
				}

				if (b.name.toLowerCase().indexOf(query) === 0) {
					isB = true;
				}

				if (isA && isB) {
					return 0;
				} else {
					if (isA) {
						return -1;
					} else {
						return 1;
					}
				}
			});
	};

	_renderBlankslate: Function = () => {
		const { data, ...rest } = this.props; // eslint-disable-line no-unused-vars

		return <RoomListContainer {...rest} />;
	};

	render() {
		return (
			<SearchableList
				autoFocus={false}
				getResults={this._getResults}
				renderRow={this._renderRow}
				renderFooter={this._renderFooter}
				renderBlankslate={this._renderBlankslate}
				searchHint='Search for groups'
			/>
		);
	}
}
