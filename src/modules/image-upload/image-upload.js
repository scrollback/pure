import crypto from 'crypto';
import winston from 'winston';
import buildAvatarURLForSize from '../../lib/buildAvatarURLForSize';
import EnhancedError from '../../lib/EnhancedError';
import { APP_PRIORITIES, TYPE_USER } from '../../lib/Constants';
import { bus, config } from '../../core-server';
import { urlTos3 } from '../../lib/upload';

function getDate({ long } = {}) {
	const date = new Date();

	if (long) {
		return date.toISOString().replace(/[\-:]/g, '').replace(/\.\d+/g, '');
	} else {
		return date.getUTCFullYear().toString() +
		('0' + date.getUTCMonth().toString()).substr(-2) +
		('0' + date.getUTCDate().toString()).substr(-2);
	}
}

function getExpiration() {
	const validity = config.s3.validity;
	return (new Date(Date.now() + validity)).toISOString();
}

// For old bucket
function getOldExpiration() {
	const validity = config.oldS3.validity;
	return (new Date(Date.now() + validity)).toISOString();
}

function sign(key, data) {
	return crypto.createHmac('sha256', key).update(data).digest();
}

function getKeyPrefix(userId, uploadType, contentId) {
	switch (uploadType) {
	case 'avatar':
		return `a/${userId}/`;
	case 'content':
		return `c/${userId}/${contentId}/`;
	default:
		throw new Error('Invalid upload type specified: ' + uploadType);
	}
}

// For old bucket
function getOldKeyPrefix(userId, uploadType, textId) {
	switch (uploadType) {
	case 'content':
		return 'uploaded/' + uploadType + '/' + userId + '/' + textId + '/';
	default:
		throw new Error('Invalid upload type specified: ' + uploadType);
	}
}

function getCredential() {
	return `${config.s3.accessKey}/${getDate()}/${config.s3.uploadRegion}/${config.s3.service}/${config.s3.signatureVersion}`;
}

// For old bucket
function getOldCredential() {
	return `${config.oldS3.accessKey}/${getDate()}/${config.oldS3.region}/${config.oldS3.service}/${config.oldS3.signatureVersion}`;
}

function getPolicy(keyPrefix) {
	return new Buffer(JSON.stringify({
		expiration: getExpiration(),
		conditions: [
			{ bucket: config.s3.uploadBucket },
			{ acl: config.s3.acl },
			[ 'starts-with', '$key', keyPrefix ],
			{ success_action_status: '201' },
			{ 'x-amz-credential': getCredential() },
			{ 'x-amz-algorithm': config.s3.algorithm },
			{ 'x-amz-date': getDate({ long: true }) },
		],
	})).toString('base64');
}

// For old bucket
function getOldPolicy(keyPrefix) {
	return new Buffer(JSON.stringify({
		expiration: getOldExpiration(),
		conditions: [
			{ bucket: config.oldS3.bucket },
			{ acl: config.oldS3.acl },
			[ 'starts-with', '$key', keyPrefix ],
			{ success_action_status: '201' },
			{ 'x-amz-credential': getOldCredential() },
			{ 'x-amz-algorithm': config.oldS3.algorithm },
			{ 'x-amz-date': getDate({ long: true }) },
		],
	})).toString('base64');
}

function getSignature(policy) {
	const kDate = sign('AWS4' + config.s3.secretKey, getDate());
	const kRegion = sign(kDate, config.s3.uploadRegion);
	const kService = sign(kRegion, config.s3.service);
	const signingKey = sign(kService, config.s3.signatureVersion);
	const signature = sign(signingKey, policy).toString('hex');
	return signature;
}

// For old bucket
function getOldSignature(policy) {
	const kDate = sign('AWS4' + config.oldS3.secretKey, getDate());
	const kRegion = sign(kDate, config.oldS3.region);
	const kService = sign(kRegion, config.oldS3.service);
	const signingKey = sign(kService, config.oldS3.signatureVersion);
	const signature = sign(signingKey, policy).toString('hex');
	return signature;
}

export function getResponse(policyReq) {
	const keyPrefix = getKeyPrefix(policyReq.auth.user, policyReq.uploadType, policyReq.contentId),
		policy = getPolicy(keyPrefix),
		signature = getSignature(policy),
		requestUrl = `http://${config.s3.uploadBucket}.${config.s3.service}-${config.s3.uploadRegion}.amazonaws.com/`,
		filename = policyReq.filename;

	let key = keyPrefix,
		original = `https://${config.s3.uploadBucket}/`,
		sizes;

	const thumbnailHost = `https://${config.s3.generateBucket}/${keyPrefix}`;

	if (/\s{2,}/.test(filename)) {
		throw new Error('S3 does not support filenames with multiple spaces');
	}

	const ext = filename.split('.').pop() || 'jpg';

	switch (policyReq.uploadType) {
	case 'avatar':
		sizes = [ 16, 24, 32, 48, 64, 72, 96, 128, 256, 320, 480, 512, 960 ];
		key += 'avatar.' + ext;
		original += key;
		break;
	case 'content':
		sizes = [ 120, 240, 320, 480, 640, 960 ];
		key += 'content.' + ext;
		original += key;
		break;
	}

	return {
		request_url: requestUrl,
		original,
		thumbnails: sizes.map(size => thumbnailHost + size + '.jpg'),
		policy: {
			key,
			acl: config.s3.acl,
			policy,
			success_action_status: '201',
			'x-amz-algorithm': config.s3.algorithm,
			'x-amz-credential': getCredential(),
			'x-amz-date': getDate({ long: true }),
			'x-amz-signature': signature,
		},
	};
}

// For old bucket
export function getOldResponse(policyReq) {
	const keyPrefix = getOldKeyPrefix(policyReq.auth.user, policyReq.uploadType, policyReq.textId),
		policy = getOldPolicy(keyPrefix),
		signature = getOldSignature(policy);

	return {
		acl: config.oldS3.acl,
		policy,
		keyPrefix,
		bucket: config.oldS3.bucket,
		'x-amz-algorithm': config.oldS3.algorithm,
		'x-amz-credential': getOldCredential(),
		'x-amz-date': getDate({ long: true }),
		'x-amz-signature': signature,
	};
}

if (!config.s3) {
	winston.info('Image upload is disabled');
	bus.on('s3/getPolicy', (policyReq) => {
		policyReq.response = {};
		policyReq.response.error = new EnhancedError('Image upload is disabled', 'NO_CONFIG_FOUND_FOR_S3');
	}, APP_PRIORITIES.IMAGE_UPLOAD);
} else {
	bus.on('s3/getPolicy', (policyReq) => {
		/*
	     * policy requests from new clients are going to have
	     * the filename property. use it to distinguish
	     * the clients and handle the fallback.
		 */
		try {
			if (policyReq.filename) {
				// generate response for the new client
				policyReq.response = getResponse(policyReq);
			} else {
				// generate response for the old client
				policyReq.response = getOldResponse(policyReq);
			}
		} catch (error) {
			policyReq.response = { error };
		}
	}, APP_PRIORITIES.IMAGE_UPLOAD);
	winston.info('Image upload is ready');
}

const uploadImage = async (userName: string, imageUrl: string, propName: string) => {
	const imageName = 'avatar.jpg';
	await urlTos3(buildAvatarURLForSize(imageUrl, 1024), 'a/' + userName + '/' + imageName);
	const changes = {
		entities: {
			[userName]: {
				type: TYPE_USER,
				id: userName,
				[propName]: {
					picture: [ '$delete' ]
				}
			}
		}
	};

	changes.source = 'belong';
	bus.emit('change', changes);
};

if (config.s3) {
	bus.on('postchange', async ({ entities }) => {
		const promises = [];
		if (entities) {
			for (const id in entities) {
				const entity = entities[id];
				if (entity.type !== TYPE_USER) {
					continue;
				} else {
					if (entity.params && entity.params.picture) {
						promises.push(
							uploadImage(entity.id, entity.params.picture, 'params')
						);
					} else if (entity.meta && entity.meta.picture) {
						promises.push(
							uploadImage(entity.id, entity.meta.picture, 'meta')
						);
					}
				}
			}
		}
		await Promise.all(promises);
	});
}
