/* @flow */

import GCM from '../modules/GCM';
import type { Action } from '../../modules/store/SimpleStoreTypes';

export default function(action: Action) {
	switch (action.type) {
	case 'DISMISS_NOTE':
		if (action.payload && action.payload.id) {
			GCM.deleteNotification(action.payload.id);
		}
		break;
	case 'MARK_ALL_NOTES_AS_READ':
		GCM.markCurrentNotificationsAsRead();
		break;
	case 'DISMISS_ALL_NOTES':
		GCM.clearCurrentNotifications();
		break;
	}
}
