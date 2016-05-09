import test from 'ava';
import { calculateDistance, getFormattedDistance } from '../Distance';

test('should calculate distance', t => {
	t.is(calculateDistance({
		latitude: 12.9716,
		longitude: 77.5946,
	}, {
		latitude: 19.0760,
		longitude: 72.8777,
	}), 845318.3856559485);
	t.is(calculateDistance({
		latitude: 12.9716,
		longitude: 77.5946,
	}, {
		latitude: 51.5074,
		longitude: 0.1278,
	}), 8017473.69587397);
});

test('should get formatted distance', t => {
	t.is(getFormattedDistance({
		latitude: 12.9613,
		longitude: 77.6561,
	}, {
		latitude: 12.9629,
		longitude: 77.6595,
	}), '409 m');
	t.is(getFormattedDistance({
		latitude: 12.9716,
		longitude: 77.5946,
	}, {
		latitude: 19.0760,
		longitude: 72.8777,
	}), '845.3 km');
	t.is(getFormattedDistance({
		latitude: 12.9716,
		longitude: 77.5946,
	}, {
		latitude: 51.5074,
		longitude: 0.1278,
	}), '8017.5 km');
});
