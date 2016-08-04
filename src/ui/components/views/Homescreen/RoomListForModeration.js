/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import RoomListContainer from '../../containers/RoomListContainer';
import SearchableList from '../Search/SearchableList';
import RoomItem from './RoomItem';
import type { Room } from '../../../../lib/schemaTypes';

type Props = {
	getResults: Function;
	onNavigate: Function;
}

export default class RoomListForModeration extends Component<void, Props, void> {
	static propTypes = {
		getResults: PropTypes.func.isRequired,
		onNavigate: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handleSelectLocality = (room: Room) => {
		this.props.onNavigate({
			type: 'PUSH_ROUTE',
			payload: {
				name: 'room',
				props: {
					room: room.id,
				},
			},
		});
	};

	_renderRow = (room: Room) => {
		return (
			<RoomItem
				key={room.id}
				room={room}
				onSelect={this._handleSelectLocality}
			/>
		);
	};

	_getResults = (filter: string) => {
		return new Observable(observer => {
			return this.props.getResults(filter).subscribe({
				next(results) {
					if (results.length) {
						const data = results.filter(item => typeof item.type !== 'string');

						observer.next(data.length ? data : '@@loading');
					} else {
						observer.next(results);
					}
				},

				error(e) {
					observer.error(e);
				},

				complete(value) {
					observer.complete(value);
				},
			});
		});
	};

	_renderBlankslate = () => {
		const { getResults, ...rest } = this.props; // eslint-disable-line no-unused-vars

		return <RoomListContainer {...rest} />;
	};

	render() {
		return (
			<SearchableList
				autoFocus={false}
				getResults={this._getResults}
				renderRow={this._renderRow}
				renderBlankslate={this._renderBlankslate}
				searchHint='Search for groups'
			/>
		);
	}
}
