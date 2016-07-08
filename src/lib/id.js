export function getTypeFromId(id) {
	const _split = id.split('_');

	if (_split.length === 3) return 'note';
	else if (_split.length === 2) return 'rel';
	else if (id.length >= 36) return 'item';
	else return 'user';
}
