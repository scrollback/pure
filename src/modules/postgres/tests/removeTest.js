// import test from 'ava';
import { bus } from '../../../core-server';
import '../postgres';

const changes = {
	entities: {
		'9b6d5ce4-fc7e-4afb-95e9-68c3a5055d86': null,
		'ee7fe7a4-3559-4a5a-a767-3d2699892cf6': null
	}
};

bus.emit('change', changes);
