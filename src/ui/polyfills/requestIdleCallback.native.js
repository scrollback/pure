/* @flow */

import ReactNative from 'react-native';

const {
	InteractionManager,
} = ReactNative;

const pendingTasks = {};
let id = 0;

global.Promise.prototype.done = () => {}; // FIXME: Without this InteractionManager throws
global.requestIdleCallback = (callback: Function) => {
	const handle = id++;
	pendingTasks[handle] = true;
	InteractionManager.runAfterInteractions(() => {
		if (pendingTasks[handle]) {
			callback();
		}
		delete pendingTasks[handle];
	});
	return handle;
};

global.cancelIdleCallback = (handle: number) => {
	if (pendingTasks[handle]) {
		delete pendingTasks[handle];
	}
};
