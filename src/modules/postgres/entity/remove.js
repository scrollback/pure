/* flow */
/* eslint-disable no-console consistent-return */

import { TYPES, COLUMNS, TABLES } from '../../../lib/schema';
import { getTypeFromId } from '../../../lib/id';

export default function remove (id: string): {$: string; tableName: string; id: string} {
	const type = TYPES[getTypeFromId(id)];
	const tableName = TABLES[type];
	if (!(COLUMNS[type].indexOf('deleteTime') > -1)) {
		return;
	}
	return {
		$: `UPDATE ${tableName} SET deletetime = &{now} WHERE id=&{id}`,
		now: Date.now(),
		id
	};
}
