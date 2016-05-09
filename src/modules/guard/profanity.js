import fs from 'fs';

const filters = {};

fs.readdirSync(__dirname + '/badwords').forEach(filename => {
	if (filename.length === 2) {
		filters[filename] = new RegExp('\\b(' + fs.readFileSync(
			__dirname + '/badwords/' + filename
		).replace(/\n/g, '|') + ')\\b');
	}
});

function check (text, re) {
	return text.toLowerCase()
		.replace(/[4@]/g, 'a')
		.replace(/* other substitutions */)
		.replace(/* runs of non-alpha with spaces */)
		.replace(/* spaces between single characters: l i k e this */)
		.match(re);
}

module.exports = (core) => {
	core.on('change', (changes, next) => {
		if (changes.entities) { for (let entity of changes.entities) {
			let text = [
					(entity.id || ''),
					(entity.text || ''),
					(entity.title || ''),
					(entity.description || ''),
				].join(' '),
				appliedFilters = [],
				matches;

			/* TODO: populate appliedFilters using entity.parents[*].params.profanity */

			matches = appliedFilters.map(re => check(text, re)).filter(a => !!a);
			if (matches.length) return next(Error('ERR_PROFANITY'));
			next();
		} }
	});
};
