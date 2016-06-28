// Log unhandled promise rejections
import '../lib/node-unhandled-rejection';

// Setup new relic
import 'newrelic';

import '../modules/on-start/on-start';

// Socket
import '../modules/socket/socket-server';

// Auth modules
import '../modules/facebook/facebook';
import '../modules/google/google';
import '../modules/session/session';
import '../modules/signin/signin';
import '../modules/signup/signup';
import '../modules/resource/resource';

/* ########### */
import '../modules/relation/relation';
import '../modules/guard/guard-server';
import '../modules/count/count';
import '../modules/note/note';
import '../modules/score/score';
import '../modules/gcm/gcm-server';
import '../modules/postgres/postgres';
import '../modules/image-upload/image-upload';
import '../modules/query-compatability/query-compatability';
import '../modules/email/unsubscribe';
import '../modules/urlShortener/urlOperations';
import '../modules/contacts/contacts';
import '../modules/avatar/avatar';
import '../modules/client/client';
import '../modules/client/routes';
import '../modules/debug/debug-server';

import '../modules/belong/belong';
import '../modules/content-seeding/content-seeding';
import '../modules/content-seeding/news-aggregator';

// Email server
import '../modules/email/email-daemon';
// Moderator UI
import '../modules/modui/modui-server';

// Fire after other modules so they can listen to http/init
import '../modules/http/http';
