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
	pendingTasks[handle] = InteractionManager.runAfterInteractions(() => {
		callback();
		delete pendingTasks[handle];
	});
	return handle;
};

global.cancelIdleCallback = (handle: number) => {
	if (pendingTasks[handle]) {
		pendingTasks[handle].cancel();
		delete pendingTasks[handle];
	}
};
