/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import RoomItemContainer from '../../containers/RoomItemContainer';
import RoomsFooterContainer from '../../containers/RoomsFooterContainer';
import PageEmpty from '../PageEmpty';
import PageLoading from '../PageLoading';
import LoadingItem from '../LoadingItem';
import NavigationActions from '../../../navigation-rfc/Navigation/NavigationActions';
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
	onNavigation: Function;
	data: Array<{ roomrel: RoomRel; room: Room } | { type: 'loading' } | { type: 'failed' }>;
}

type State = {
	dataSource: ListView.DataSource
}

export default class Rooms extends Component<void, Props, State> {
	static propTypes = {
		onNavigation: PropTypes.func.isRequired,
		data: PropTypes.arrayOf(PropTypes.object).isRequired,
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
		return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
	}

	_handleSelectLocality: Function = room => {
		this.props.onNavigation(new NavigationActions.Push({
			name: 'room',
			props: {
				room: room.id,
			},
		}));
	};

	_renderRow: Function = result => {
		if (result && result.type === 'loading') {
			return <LoadingItem />;
		}

		const {
			roomrel,
			room,
		} = result;

		return (
			<RoomItemContainer
				key={roomrel.item}
				room={roomrel.item}
				unread={room && roomrel.presenceTime ? room.updateTime > roomrel.presenceTime : false}
				onSelect={this._handleSelectLocality}
			/>
		);
	};

	_renderFooter: Function = () => {
		return <RoomsFooterContainer onNavigation={this.props.onNavigation} />;
	};

	render() {
		let placeHolder;

		if (this.props.data.length === 1) {
			switch (this.props.data[0] && this.props.data[0].type || null) {
			case 'loading':
				placeHolder = <PageLoading />;
				break;
			case 'failed':
				placeHolder = <PageEmpty label='Failed to load rooms' image='sad' />;
				break;
			}
		}

		return (
			<View style={styles.container}>
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
