/* @flow */

export const TYPE_ITEM = 0;
export const TYPE_ROOM = 1;
export const TYPE_TEXT = 2;
export const TYPE_THREAD = 3;
export const TYPE_TOPIC = 4;
export const TYPE_PRIV = 5;
export const TYPE_USER = 10;
export const TYPE_REL = 20;
export const TYPE_ROOMREL = 21;
export const TYPE_TEXTREL = 22;
export const TYPE_THREADREL = 23;
export const TYPE_TOPICREL = 24;
export const TYPE_PRIVREL = 25;
export const TYPE_USERREL = 30;
export const TYPE_NOTE = 40;

export const ROLE_BANNED = -1;
export const ROLE_NONE = 0;
export const ROLE_VISITOR = 1;
export const ROLE_MENTIONED = 2;
export const ROLE_FOLLOWER = 3;
export const ROLE_MODERATOR = 4;
export const ROLE_OWNER = 5;
export const ROLE_CREATOR = 6;

export const ROLE_LIKE = 31;
export const ROLE_FLAG = 32;
export const ROLE_MUTE = 33;
export const ROLE_HOME = 41;
export const ROLE_WORK = 42;
export const ROLE_HOMETOWN = 43;

export const STATUS_NONE = 0;
export const STATUS_BG = 1;
export const STATUS_FG = 2;
export const STATUS_READING = 3;
export const STATUS_WRITING = 4;

export const TRANSIT_REQUEST = 1;
export const TRANSIT_INVITE = 2;
export const TRANSIT_RESTORE = 3;

export const TAG_POST_HIDDEN = -1;
export const TAG_POST_STICKY = 1;
export const TAG_POST_PHOTO = 3;

export const TAG_USER_GUEST = 10;
export const TAG_USER_CONTENT = 11;
export const TAG_USER_ADMIN = 12;
export const TAG_USER_EMAIL = 13;
export const TAG_USER_FACEBOOK = 14;
export const TAG_USER_GOOGLE = 15;
export const TAG_USER_TWITTER = 16;
export const TAG_USER_GCM = 17;
export const TAG_USER_APN = 18;
export const TAG_USER_WNS = 19;

export const TAG_ROOM_CITY = 21;
export const TAG_ROOM_AREA = 22;
export const TAG_ROOM_SPOT = 23;

export const PRESENCE_FOREGROUND = 2;
export const PRESENCE_BACKGROUND = 1;
export const PRESENCE_NONE = 0;

export const NOTE_MENTION = 1;
export const NOTE_REQUEST = 2;
export const NOTE_INVITE = 3;
export const NOTE_THREAD = 4;
export const NOTE_REPLY = 5;

export const JOB_EMAIL_WELCOME = 1;
export const JOB_EMAIL_MENTION = 2;
export const JOB_EMAIL_DIGEST = 3;

export const APP_PRIORITIES = {
	AUTHENTICATION_FACEBOOK: 900,
	AUTHENTICATION_GOOGLE: 899,
	AUTHENTICATION_SESSION: 898,
	AUTHENTICATION_SIGNIN: 897,
	AUTHENTICATION_SIGNUP: 896,
	AUTHENTICATION_RESOURCE: 894,
	AUTHENTICATION_SESSION_2: 893,
	TIMES_VALIDATION1: 892,
	RELATIONS: 890,
	NOTE: 885,
	TIMES_VALIDATION2: 880,
	USER_VALIDATION: 879,
	GCM: 800,
	SUBSCRIBE_TO_TOPICS: 750,
	IMAGE_UPLOAD: 700,
	COUNT: 650,
	SCORE: 640,
	STORAGE: 500,
};

export const ERRORS = {
	AUDIENCE_MISMATCH_FACEBOOK: 'Token was generated for different domain',
	ERR_FACEBOOK_SIGNIN_FAILED: 'Facebook signin failed for some reason',
	FACEBOOK_RESPONSE_PARSE_ERROR: 'failed to parse the data from Facebook',
	INVALID_FACEBOOK_CODE: 'Invalid Facebook taken',
	INVALID_FACEBOOK_KEY: 'Facebook api is invalid',
	INVALID_FACEBOOK_TOKEN: 'Facebook auth failed',

	AUDIENCE_MISMATCH_GOOGLE: 'Token was generated for different domain',
	ERR_GOOGLE_SIGNIN_FAILED: 'Google signin failed for some reason',
	GOOGLE_RESPONSE_PARSE_ERROR: 'failed to parse the data from Google',
	INVALID_GOOGLE_CODE: 'Invalid Google taken',
	INVALID_GOOGLE_KEY: 'Google api is invalid',
	INVALID_GOOGLE_TOKEN: 'Google auth failed',

	ERR_USER_NAME_TAKEN: 'This username is taken, please try something else'
};
