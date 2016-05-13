/* @flow */

const msPerSec = 1000;
const msPerMin = msPerSec * 60;
const msPerHour = msPerMin * 60;
const msPerDay = msPerHour * 24;
const msPerWeek = msPerDay * 7;
const msPerMonth = msPerWeek * 30;
const msPerYear = msPerMonth * 365;

const weekDays = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
const months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

export function formatShort(time: number, now: number = Date.now()): string {
	const diff = now - time;

	if (diff <= 0) {
		if (Math.abs(diff) > msPerMin) {
			return 'future';
		} else {
			return 'now';
		}
	} else if (diff < msPerMin) {
		return Math.round(diff / msPerSec) + 's';
	} else if (diff < msPerHour) {
		return Math.round(diff / msPerMin) + 'm';
	} else if (diff < msPerDay) {
		return Math.round(diff / msPerHour) + 'h';
	} else if (diff < msPerWeek) {
		return Math.round(diff / msPerDay) + 'd';
	} else if (diff < msPerYear) {
		return Math.round(diff / msPerWeek) + 'w';
	} else {
		return Math.round(diff / msPerYear) + 'y';
	}
}

export function formatLong(time: number, now: number = Date.now()): string {
	const diff = now - time;

	if (diff <= 0) {
		if (Math.abs(diff) > msPerMin) {
			return 'Future';
		} else {
			return 'Just now';
		}
	} else if (diff < msPerMin) {
		const s = Math.round(diff / msPerSec);

		return s + ' second' + (s > 1 ? 's' : '') + ' ago';
	} else if (diff < msPerHour) {
		const m = Math.round(diff / msPerMin);

		return m + ' minute' + (m > 1 ? 's' : '') + ' ago';
	} else if (diff < msPerDay) {
		const h = Math.round(diff / msPerHour);

		return h + ' hour' + (h > 1 ? 's' : '') + ' ago';
	} else {
		const date = new Date(time);
		const currentDate = new Date(now);

		let timeStr;

		if (diff < msPerWeek) {
			const day = date.getDay();

			if (Math.round(diff / msPerDay) <= 1 && day !== currentDate.getDay()) {
				timeStr = 'Yesterday';
			} else {
				timeStr = weekDays[day];
			}
		} else {
			const year = date.getFullYear();

			timeStr = date.getDate() + ' ' + months[date.getMonth()] + (year !== currentDate.getFullYear() ? ' ' + year : '');
		}

		return timeStr;
	}
}

export function getReadableTime(now: number = Date.now()): string {
	const date = new Date(now);
	const hours = date.getHours();
	const minutes = date.getMinutes();

	return `${hours > 12 ? (hours + 11) % 12 + 1 : hours}:${minutes > 10 ? minutes : '0' + minutes} ${hours > 12 ? 'pm' : 'am'}`;
}
