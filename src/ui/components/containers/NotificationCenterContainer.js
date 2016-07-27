/* @flow */

import React, { Component } from 'react';
import { DeviceEventEmitter } from 'react-native';
import GCM from '../../modules/GCM';
import NotificationCenter from '../views/Notification/NotificationCenter';
import store from '../../../modules/store/store';
import {
	markAllNotesAsRead,
	dismissAllNotes,
	dismissNote,
} from '../../../modules/store/actions';
import type { Note } from '../../../lib/schemaTypes';

type Props = {
	onNavigate: Function;
}

type State = {
	data: Array<Note | { type: 'loading' }>
}

export default class NotificationCenterContainer extends Component<void, Props, State> {

	state: State = {
		data: [ { type: 'loading' } ],
	};

	componentDidMount() {
		this._updateData();

		this._subscription = DeviceEventEmitter.addListener('GCMDataUpdate', () => {
			this._updateData();
		});
	}

	componentWillUnmount() {
		this._subscription.remove();
	}

	_subscription: any;

	_dismissNote = (id: string) => {
		store.dispatch(dismissNote(id));
	}

	_dismissAllNotes = () => {
		store.dispatch(dismissAllNotes());
	}

	_markAllNotesAsRead = () => {
		store.dispatch(markAllNotesAsRead());
	}

	_updateData = async () => {
		const data = await GCM.getCurrentNotifications();

		if (data) {
			this.setState({
				data: data.filter(note => !note.readTime),
			});
		}
	};

	render() {
		return (
			<NotificationCenter
				{...this.props}
				data={this.state.data}
				dismissNote={this._dismissNote}
				dismissAllNotes={this._dismissAllNotes}
				markAllNotesAsRead={this._markAllNotesAsRead}
			/>
		);
	}
}
