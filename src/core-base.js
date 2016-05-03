/* @flow */

import Ebus from 'ebus';
import Know from './submodules/know/lib/Cache';
import * as Constants from './lib/Constants';

export type Bus = {
	on(event: string, callback: Function, priority?: number|string): void;
	off(event: string, callback: Function): void;
	emit(event: string, options?: Object, callback?: Function): void;
	dump(event: string): void;
	setDebug(level: number): void;
}

export const bus: Bus = new Ebus();

export const cache = new Know({
	is: (entity, type) => {
		if (!entity) return false;
		switch (type) {
		case 'thread':
			return entity.type === Constants.TYPE_THREAD;
		case 'text':
			return entity.type === Constants.TYPE_TEXT;
		case 'user':
			return entity.type === Constants.TYPE_USER;
		case 'room':
			return entity.type === Constants.TYPE_ROOM;
		case 'note':
			return entity.type === Constants.TYPE_NOTE;
		case 'topic':
			return entity.type === Constants.TYPE_TOPIC;
		case 'rel':
			return entity.type === Constants.TYPE_REL;
		case 'textrel':
			return entity.type === Constants.TYPE_TEXTREL;
		case 'threadrel':
			return entity.type === Constants.TYPE_THREADREL;
		case 'topicrel':
			return entity.type === Constants.TYPE_TOPICREL;
		case 'userrel':
			return entity.type === Constants.TYPE_USERREL;
		case 'roomrel':
			return entity.type === Constants.TYPE_ROOMREL;
		}

		return false;
	},
	id: (entity) => {
		if (!entity) return '';
		switch (entity.type) {
		case Constants.TYPE_THREAD:
		case Constants.TYPE_TEXT:
		case Constants.TYPE_USER:
		case Constants.TYPE_ROOM:
		case Constants.TYPE_NOTE:
		case Constants.TYPE_TOPIC:
			return entity.id;
		case Constants.TYPE_REL:
		case Constants.TYPE_TEXTREL:
		case Constants.TYPE_THREADREL:
		case Constants.TYPE_TOPICREL:
		case Constants.TYPE_USERREL:
			return entity.user + '_' + entity.item;
		}
		return entity.id;
	}
});
