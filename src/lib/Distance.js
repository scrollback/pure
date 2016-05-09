/* @flow */

export type Location = { latitude: number; longitude: number };

export const EARTH_RADIUS = 6371000; // In meters

export const toRadians = (degrees: number): number => degrees * Math.PI / 180;

export function calculateDistance(from: Location, to: Location): number {
	const dLat = toRadians(from.latitude - to.latitude);
	const dLong = toRadians(from.longitude - to.longitude);

	const a = (Math.sin(dLat / 2) * Math.sin(dLat / 2)) +
			(Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(dLong / 2) * Math.sin(dLong / 2));

	return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * EARTH_RADIUS;
}

export function compareAreas(o: Location, a1: Location, a2: Location): number {
	const dist1 = calculateDistance(o, a1);
	const dist2 = calculateDistance(o, a2);

	if (dist1 > dist2) {
		return 1;
	}

	if (dist1 < dist2) {
		return -1;
	}

	return 0;
}

export function getFormattedDistance(from: Location, to: Location): string {
	const dist = Math.round(calculateDistance(from, to));

	return (dist < 1000) ? (dist + ' m') : (Math.round(dist / 100) / 10 + ' km');
}
