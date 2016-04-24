/* @flow */

import ReactNative from 'react-native';

const {
	InteractionManager,
} = ReactNative;

global.requestIdleCallback = cb => setTimeout(() => InteractionManager.runAfterInteractions(cb), 0);
global.cancelIdleCallback = handle => clearTimeout(handle);
