/* @flow */

import { config } from '../../core-client';
import store from '../store/store';
import Contacts from '../../ui/modules/Contacts';

const {
	protocol,
	host,
} = config.server;
const endpoint = `${protocol}//${host}/x/contacts`;

export default function uploadContacts() {
	const { session } = store.getState();

	if (session) {
		Contacts.sendContacts(endpoint, {
			auth: {
				session,
			},
		});
	}
}
