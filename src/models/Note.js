/* @flow */

import Model from './Model';
import { TYPE_NOTE } from '../lib/Constants';

const shape = {
	count: 'number',
	data: 'object',
	createTime: 'number',
	dismissTime: 'number',
	event: 'number',
	group: 'string',
	readTime: 'number',
	score: 'number',
	updateTime: 'number',
	user: 'string',
	type: t => t !== TYPE_NOTE,
	error: e => e instanceof Error,
};

const defaults = {
	type: TYPE_NOTE,
};

export default class Note extends Model(shape, defaults) {
	count: number;
	data: {
		body: string;
		creator: string;
		id: string;
		link: string;
		picture?: string;
		room?: {
			id: string;
			name?: string;
		};
		thread?: {
			id: string;
			name?: string;
		};
		title: string;
	};
	createTime: number;
	dismissTime: ?number;
	event: number;
	group: string;
	readTime: ?number;
	score: number;
	type: number;
	updateTime: number;
	user: string;

	/* $FlowFixMe */
	get id(): string {
		return this.user + '_' + this.event + '_' + this.group;
	}
}
