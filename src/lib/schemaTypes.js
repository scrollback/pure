/* @flow */

export type Entity = {
	counts?: { [key: string]: number };
	createTime: number;
	deleteTime?: number;
	id: string;
	meta?: Object;
	name?: string;
	params?: Object;
	tags?: Array<number>;
	type: number;
	updateTime?: number;
}

export type User = Entity & {
	identities: Array<string>;
	locale?: number;
	params?: {
		gcm?: {
			[key: string]: string;
		};
		google?: {
			name?: string;
			picture?: string;
			verified?: boolean;
		};
		facebook?: {
			name?: string;
			picture?: string;
			verified?: boolean;
		};
		places?: {
			home?: { id: string; title: string; description: string };
			work?: { id: string; title: string; description: string };
			hometown?: { id: string; title: string; description: string };
		};
		email?: {
			notifications?: boolean;
			frequency?: 'daily' | 'never';
		}
	};
	presence?: number;
	presenceTime?: number;
	resources?: { [key: string]: number };
	timezone?: number;
}

export type Item = Entity & {
	body?: string;
	creator?: string;
	parents: Array<string>;
	score?: number;
	updater: string;
}

export type Room = Item & {
	identities?: Array<string>;
	updateTime?: number;
}

export type Text = Item & {
	body: string;
	creator: string;
}

export type Thread = Text & {
	name: string;
	score: number;
}

export type Topic = Item

export type Priv = Item

export type Relation = {
	admin?: boolean;
	expireTime?: number;
	interest?: number;
	item: string;
	message?: string;
	presence?: number;
	presenceTime?: number;
	resources?: { [key: string]: number };
	roles?: Array<number>;
	createTime: number;
	updateTime?: number;
	tags?: Array<number>;
	transitRole?: number;
	transitType?: number;
	type: number;
	user: string;
}

export type RoomRel = Relation

export type TextRel = Relation

export type ThreadRel = Relation

export type TopicRel = Relation

export type PrivRel = Relation

export type Note = {
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
	dismissTime?: number;
	event: number;
	group: string;
	readTime?: number;
	score: number;
	type: number;
	updateTime?: number;
	user?: string;
}
