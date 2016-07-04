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
GCM.configureNotification({
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
			title: '{{length}} new in {{#roomNames.0}}{{roomNames.0}}{{#roomNames.1}}, {{roomNames.1}}{{/roomNames.1}} and other groups{{/roomNames.0}}{{^roomNames.0}}Belong{{/roomNames.0}}',
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
