/* @flow */

import store from '../store/store';
import GCM from '../../ui/modules/GCM';
import Colors from '../../ui/Colors';

const TITLE_TEMPLATE = '{{#roomNames.1}}{{#roomNames.0}}{{roomNames.0}}, {{roomNames.1}} and others{{/roomNames.0}}{{/roomNames.1}}{{^roomNames.1}}New activity in {{#roomNames.0}}{{roomNames.0}}{{/roomNames.0}}{{^roomNames.0}}Belong{{/roomNames.0}}{{/roomNames.1}}';

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
	category: 'social',
	color: Colors.primary,
	count: true,
	template: {
		title: `{{#single}}{{items.0.data.title}}{{/single}}{{^single}}${TITLE_TEMPLATE}{{/single}}`,
		body: '<b>{{items.0.data.creator}}</b>: {{items.0.data.body}}',
		picture: '{{#single}}{{{items.0.data.picture}}}{{/single}}',
		link: '{{#single}}{{{items.0.data.link}}}{{/single}}{{^single}}/p/notes{{/single}}',
		style: {
			title: TITLE_TEMPLATE,
			line: '<b>{{item.data.creator}}</b>: {{item.data.body}}',
			summary: '{{^single}}{{length}} new notifications{{/single}}',
		},
	}
});

store.observe({ type: 'state', path: 'session', source: 'gcm' }).forEach(session => {
	if (session === '@@loading') {
		return;
	}

	GCM.setSessionID(session || '');
});
