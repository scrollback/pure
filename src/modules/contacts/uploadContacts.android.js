/* @flow */

import { config, cache } from '../../core-client';
import Contacts from '../../ui/modules/Contacts';

const {
	protocol,
	host,
} = config.server;
const endpoint = `${protocol}//${host}/x/contacts`;

export default function uploadContacts() {
	const session = cache.getState('session');

	if (session) {
		Contacts.sendContacts(endpoint, {
			auth: {
				session,
			},
		});
	}
}
