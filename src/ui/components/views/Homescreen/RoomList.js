/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import RoomItemContainer from '../../containers/RoomItemContainer';
import RoomsFooterContainer from '../../containers/RoomsFooterContainer';
import PageLoading from '../Page/PageLoading';
import LoadingItem from '../Core/LoadingItem';
import type { RoomRel, Room } from '../../../../lib/schemaTypes';

const {
	StyleSheet,
	View,
	ListView,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

type Props = {
	onNavigate: Function;
	data: Array<{ roomrel: RoomRel; room: Room } | { type: 'loading' } | { type: 'failed' }>;
	style?: any;
}

type State = {
	dataSource: ListView.DataSource
}

export default class Rooms extends Component<void, Props, State> {
	static propTypes = {
		onNavigate: PropTypes.func.isRequired,
		data: PropTypes.arrayOf(PropTypes.object).isRequired,
		style: View.propTypes.style,
	};

	state: State = {
		dataSource: new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2,
		}),
	};

	componentWillMount() {
		this.setState({
			dataSource: this.state.dataSource.cloneWithRows(this.props.data),
		});
	}

	componentWillReceiveProps(nextProps: Props) {
		this.setState({
			dataSource: this.state.dataSource.cloneWithRows(nextProps.data),
		});
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
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

	_renderRow = (result: { room: Room; roomrel: RoomRel; type?: string; }) => {
		if (result && result.type === 'loading') {
			return <LoadingItem />;
		}

		const {
			roomrel,
			room,
		} = result;

		return (
			<RoomItemContainer
				key={roomrel.item || room.id}
				room={roomrel.item || room.id}
				unread={room && roomrel.presenceTime ? room.updateTime > roomrel.presenceTime : false}
				onSelect={this._handleSelectLocality}
			/>
		);
	};

	_renderFooter = () => {
		return <RoomsFooterContainer onNavigate={this.props.onNavigate} />;
	};

	render() {
		const { data } = this.props;

		let placeHolder;

		if (data.length === 1) {
			switch (data[0] && data[0].type || null) {
			case 'loading':
				placeHolder = <PageLoading />;
				break;
			}
		}

		return (
			<View {...this.props} style={[ styles.container, this.props.style ]}>
				{placeHolder ? placeHolder :
					<ListView
						keyboardShouldPersistTaps
						dataSource={this.state.dataSource}
						renderRow={this._renderRow}
						renderFooter={this._renderFooter}
					/>
				}
			</View>
		);
	}
}
