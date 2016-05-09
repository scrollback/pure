'use strict';

require('babel-core/register');

const core = require('../../../core-server'),
	Constants = require('../../../lib/Constants');

core.config = { connStr: 'pg://aravind@localhost/aravind' };

require('../postgres');

core.bus.emit('change', { entities: {
	'a807d644-eb87-43a5-ab2d-3f630c222975': {
		id: 'a807d644-eb87-43a5-ab2d-3f630c222975',
		type: Constants.TYPE_ROOM,
		name: 'Open House',
		body: 'Chat with all heyneighbor users',
		createTime: Date.now(),
	},
} });
