/* @flow */

import AWS from 'aws-sdk';
import promisify from './promisify';
import { PassThrough } from 'stream';
import { config } from '../core-server';
import request from 'request';

type UploadResult = {
    Location: string
};

const configureAmazonS3 = () => {
	AWS.config.update({
		accessKeyId: config.s3.contentAccessKey,
		secretAccessKey: config.s3.contentSecretKey,
		region: config.s3.uploadRegion
	});

	AWS.config.apiVersions = {
		s3: '2016-06-18'
	};

	return new AWS.S3();
};

const s3 = configureAmazonS3();
const uploadFile = promisify(s3.upload.bind(s3));
export function streamTos3(imageReadStream: any, destinationURL: string):Promise<UploadResult> {
	const passthrough = new PassThrough();
	imageReadStream.pipe(passthrough).on('error', e => {
		console.log('Error in piping image stream: ', e.message);
	});

	const data = {
		Bucket: config.s3.uploadBucket,
		Key: destinationURL,
		Body: passthrough,
		acl: 'public-read'
	};
	return uploadFile(data);
}

export function urlTos3(source: string, dest: string) {
	const imageReadStream = request.get(source);
	return streamTos3(imageReadStream, dest);
}
