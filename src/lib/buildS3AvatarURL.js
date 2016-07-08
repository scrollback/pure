/* @flow */

export default function buildS3AvatarURL(userName: string, size: number = 24): string {
	const avatarSizes = [ 16, 24, 32, 48, 64, 72, 96, 128, 256, 320, 480, 512, 640, 960 ];
	/*
		- In case of a size which is not available in the avatarSizes array,
		  find the next greatest size to the given size from the array.
		- In case the size exceeds 960, return 960.
	*/
	const length = avatarSizes.length;
	let sizeToReturn;
	if (size > avatarSizes[length - 1]) {
		sizeToReturn = avatarSizes[length - 1];
	} else {
		for (const avatarSize of avatarSizes) {
			if (avatarSize >= size) {
				sizeToReturn = avatarSize;
				break;
			}
		}
	}
	return `https://s.bel.ng/a/${userName}/${sizeToReturn}.jpeg`;
}
