/* @flow */

export type Embed = {
	type: 'photo' | 'video' | 'link' | 'rich';
	url?: string;
	title?: string;
	description?: string;
	author_name?: string;
	provider_name?: string;
	provider_url?: string;
	cache_age?: number;
	thumbnail_url?: string;
	thumbnail_width?: number;
	thumbnail_height?: number;
	width?: number;
	height?: number;
}
