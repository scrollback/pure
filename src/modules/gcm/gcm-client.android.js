/* @flow */

import store from '../store/store';
import GCM from '../../ui/modules/GCM';
import Colors from '../../ui/Colors';

GCM.clearCurrentNotifications();
GCM.configureSchema({
	count: 'number',
	data: {
		body: 'string',
		link: 'string',
		picture: 'string',
		title: 'string',
	},
	createTime: 'number',
	score: 'number',
});
GCM.configureAppearance({
	style: 'inbox',
	sticky: false,
	slient: true,
	priority: 'normal',
	category: 'message',
	color: Colors.primary,
	template: {
		title: '{{items.0.data.title}}',
		body: '{{items.0.data.body}}',
		picture: '{{items.0.data.picture}}',
		link: '{{items.0.data.link}}',
		style: {
			title: '{{length}} notifications in {{items.0.data.room.name}} and other groups',
			line: '{{item.data.title}} - {{item.data.body}}',
		},
	}
});

store.observe({ type: 'state', path: 'session', source: 'gcm' }).forEach(session => {
	if (session === '@@loading') {
		return;
	}

	GCM.setSessionID(session || '');
});
