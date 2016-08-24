/* @flow */

import store from '../store/store';
import GCM from '../../ui/modules/GCM';
import Colors from '../../ui/Colors';

const isSingle = Math.random() < 0.5;
const titleTemplate = '{{#roomNames.1}}{{#roomNames.0}}{{roomNames.0}}, {{roomNames.1}} and others{{/roomNames.0}}{{/roomNames.1}}{{^roomNames.1}}New activity in {{#roomNames.0}}{{roomNames.0}}{{/roomNames.0}}{{^roomNames.0}}Belong{{/roomNames.0}}{{/roomNames.1}}';

const singleTemplate = {
	title: '{{items.0.data.title}}',
	body: '<b>{{items.0.data.creator}}</b>: {{items.0.data.body}}',
	picture: '{{{items.0.data.picture}}}',
	link: '{{{items.0.data.link}}}',
};

const multiTemplate = {
	title: `{{#single}}{{items.0.data.title}}{{/single}}{{^single}}${titleTemplate}{{/single}}`,
	body: '<b>{{items.0.data.creator}}</b>: {{items.0.data.body}}',
	picture: '{{#single}}{{{items.0.data.picture}}}{{/single}}',
	link: '{{#single}}{{{items.0.data.link}}}{{/single}}{{^single}}/p/notes{{/single}}',
	actions: [
		{
			label: '{{^single}}VIEW NOTIFICATIONS{{/single}}',
			link: '/p/notes',
			icon: 'ic_menu_forward.png',
		},
	],
	style: {
		title: titleTemplate,
		line: '<b>{{item.data.creator}}</b>: {{item.data.body}}',
		summary: '{{^single}}{{length}} new notifications{{/single}}',
	},
};

GCM.cancelCurrentNotifications();
GCM.markCurrentNotificationsAsRead();
GCM.configureSchema({
	event: 'number',
	count: 'number',
	data: {
		body: 'string',
		link: 'string',
		picture: 'string',
		title: 'string',
	},
	createTime: 'number',
	group: 'string',
});
GCM.configureNotification({
	style: isSingle ? 'bigtext' : 'inbox',
	sticky: false,
	slient: true,
	priority: 'normal',
	category: 'social',
	color: Colors.primary,
	count: !isSingle,
	template: isSingle ? singleTemplate : multiTemplate,
});

store.observe({ type: 'state', path: 'session', source: 'gcm' }).forEach(session => {
	if (session === '@@loading') {
		return;
	}

	GCM.setSessionID(session || '');
});
