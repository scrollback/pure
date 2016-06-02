import 'newrelic';
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
// import '../modules/gcm/gcm-server';
import '../modules/postgres/postgres';
import '../modules/image-upload/image-upload';
import '../modules/email/unsubscribe';
import '../modules/contacts/contacts';
import '../modules/avatar/avatar';
import '../modules/client/client';
import '../modules/client/routes';
import '../modules/debug/debug-server';

import '../modules/belong/belong';
import '../modules/content-seeding/content-seeding';

// Email server
// import '../modules/email/email-daemon';
// Moderator UI
import '../modules/modui/modui-server';

// if fired before socket server then the http/init listener might not be listening.
import '../modules/http/http';
