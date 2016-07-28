/* @flow */

import React, { Component } from 'react';
import { DeviceEventEmitter, InteractionManager } from 'react-native';
import GCM from '../../modules/GCM';
import NotificationCenter from '../views/Notification/NotificationCenter';
import store from '../../../modules/store/store';
import {
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
		this._handle = InteractionManager.runAfterInteractions(() => {
			this._updateData();
			this._subscription = DeviceEventEmitter.addListener('GCMDataUpdate', this._updateData.bind(this));
		});
	}

	componentWillUnmount() {
		if (this._subscription) {
			this._subscription.remove();
		}
		this._handle.cancel();
	}

	_subscription: any;
	_handle: any;

	_dismissNote = (id: string) => {
		this.setState({
			data: this.state.data.filter(note => {
				/* $FlowFixMe */
				return note.id !== id;
			}),
		});

		store.dispatch(dismissNote(id));
	}

	_updateData = async () => {
		const data = await GCM.getCurrentNotifications();

		if (data) {
			this.setState({
				data: data.slice(0).reverse(),
			});
		}
	};

	render() {
		return (
			<NotificationCenter
				{...this.props}
				data={this.state.data}
				dismissNote={this._dismissNote}
			/>
		);
	}
}
