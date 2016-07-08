/* @flow */

type NotificationStyle = 'bigtext' | 'bigpicture' | 'inbox';
type NotificationCategory = 'alarm' | 'call' | 'email' | 'error' | 'event' | 'message' | 'progress' | 'promo' | 'recommendation' | 'service' | 'social' | 'status' | 'system' | 'transport';
type NotificationPriority = 'min' | 'low' | 'normal' | 'high' | 'max';

type Appearance = {
	style: NotificationStyle;
	category: NotificationCategory;
	priority: NotificationPriority;
	sticky: boolean;
	slient: boolean;
	vibrate: Array<number>;
	template: {
		title: string;
		body: string;
		picture: string;
		link: string;
		style: {
			title: string;
			summary: string;
			line: string;
		};
	};
}

export default class GCM {
	static configureSchema: (schema: Object) => Promise<void>;
	static configureNotification: (appearance: Appearance) => Promise<void>;
	static setSessionID: (session: string) => void;
	static enableNotifications: () => void;
	static disableNotifications: () => void;
	static isNotificationsEnabled: () => Promise<boolean>;
	static getCurrentNotifications: () => Promise<Array<Object>>;
	static clearCurrentNotifications: () => void;
	static getRegistrationToken: () => Promise<string>;
}
