/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import PeopleListItem from './PeopleListItem';
import PageEmpty from '../Page/PageEmpty';
import PageLoading from '../Page/PageLoading';
import ListHeader from '../Core/ListHeader';
import { PRESENCE_FOREGROUND } from '../../../../lib/Constants';
import type { User, RoomRel, ThreadRel } from '../../../../lib/schemaTypes';

const {
	ListView,
} = ReactNative;

type Props = {
	data: Array<{ rel: RoomRel | ThreadRel; user: User } | { type: 'loading' } | { type: 'failed' }>;
	onNavigate: Function;
}

type State = {
	dataSource: ListView.DataSource
}

export default class PeopleList extends Component<void, Props, State> {
	static propTypes = {
		data: PropTypes.arrayOf(PropTypes.object).isRequired,
		onNavigate: PropTypes.func.isRequired,
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

	_dataSource: ListView.DataSource = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

	_renderHeader = () => <ListHeader>People talking</ListHeader>;

	_renderRow = (relation: { rel: RoomRel | ThreadRel; user: User }) => (
		<PeopleListItem
			key={relation.user}
			user={relation.user}
			status={relation.rel.presence === PRESENCE_FOREGROUND ? 'online' : 'offline'}
			onNavigate={this.props.onNavigate}
		/>
	);

	render() {
		const { data } = this.props;

		if (data.length === 0) {
			return <PageEmpty label='Nobody here' image='sad' />;
		} else if (data.length === 1) {
			switch (data[0] && data[0].type || null) {
			case 'loading':
				return <PageLoading />;
			case 'failed':
				return <PageEmpty label='Failed to load people list' image='sad' />;
			}
		}

		return (
			<ListView
				dataSource={this.state.dataSource}
				renderHeader={this._renderHeader}
				renderRow={this._renderRow}
			/>
		);
	}
}
