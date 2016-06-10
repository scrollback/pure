/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import NotificationCenterItem from './NotificationCenterItem';
import PageEmpty from '../Page/PageEmpty';
import PageLoading from '../Page/PageLoading';
import type { Note } from '../../../../lib/schemaTypes';

const {
	ListView,
} = ReactNative;

type Props = {
	dismissNote: Function;
	onNavigate: Function;
	data: Array<Note | { type: 'loading' } | { type: 'failed' }>;
}

type State = {
	dataSource: ListView.DataSource
}

export default class NotificationCenter extends Component<void, Props, State> {
	static propTypes = {
		dismissNote: PropTypes.func.isRequired,
		onNavigate: PropTypes.func.isRequired,
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
		return shallowCompare(this, nextProps, nextState);
	}

	_renderRow = (note: Note) => (
		<NotificationCenterItem
			key={`${note.user}_${note.event}_${note.group}`}
			note={note}
			onNavigate={this.props.onNavigate}
			dismissNote={this.props.dismissNote}
		/>
	);

	render() {
		const { data } = this.props;

		if (data.length === 0) {
			return <PageEmpty label='No new notifications' image='cool' />;
		} else if (data.length === 1 && data[0].type === 'loading') {
			return <PageLoading />;
		} else {
			return (
				<ListView
					dataSource={this.state.dataSource}
					renderRow={this._renderRow}
				/>
			);
		}
	}
}
