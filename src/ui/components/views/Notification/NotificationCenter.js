/* @flow */

import React, { Component, PropTypes } from 'react';
import {
	ListView,
	RecyclerViewBackedScrollView,
} from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import NotificationCenterItem from './NotificationCenterItem';
import PageEmpty from '../Page/PageEmpty';
import PageLoading from '../Page/PageLoading';
import type { Note as NoteBase } from '../../../../lib/schemaTypes';

type Note = NoteBase & {
	id: string;
}

type Props = {
	dismissNote: Function;
	onNavigate: Function;
	data: Array<Note | { type: 'loading' }>;
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
			sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
			rowHasChanged: (row1, row2) => row1 !== row2,
		}),
	};

	componentWillMount() {
		this.setState({
			dataSource: this.state.dataSource.cloneWithRowsAndSections({ notes: this.props.data }),
		});
	}

	componentWillReceiveProps(nextProps: Props) {
		this.setState({
			dataSource: this.state.dataSource.cloneWithRowsAndSections({ notes: nextProps.data }),
		});
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_renderRow = (note: Note) => {
		return (
			<NotificationCenterItem
				key={note.id}
				note={note}
				onNavigate={this.props.onNavigate}
				onDismiss={() => this.props.dismissNote(note.id)}
			/>
		);
	};

	_renderScrollComponent = (props: any) => {
		return <RecyclerViewBackedScrollView {...props} />;
	};

	render() {
		const { data } = this.props;

		if (data.length === 0) {
			return <PageEmpty label='No new notifications' image={require('../../../../../assets/holiday-chill.png')} />;
		} else if (data.length === 1 && data[0].type === 'loading') {
			return <PageLoading />;
		} else {
			return (
				<ListView
					removeClippedSubviews
					keyboardShouldPersistTaps={false}
					initialListSize={10}
					pageSize={10}
					renderRow={this._renderRow}
					renderScrollComponent={this._renderScrollComponent}
					dataSource={this.state.dataSource}
				/>
			);
		}
	}
}
