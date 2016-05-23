/* @flow */

import AWS from 'aws-sdk';
import fs from 'fs';
import promisify from '../../lib/promisify';
import { PassThrough } from 'stream';
import { config } from '../../core-server';

type UploadResult = {
    Location: string
};

const configureAmazonS3 = () => {
	AWS.config.update({
		accessKeyId: config.s3.accessKey, 
		secretAccessKey: config.s3.secretKey, 
		region: config.s3.region
	});

	AWS.config.apiVersions = {
	  	s3: '2016-06-18'
	};

	return new AWS.S3();
};

const s3 = configureAmazonS3();
const uploadFile = promisify(s3.upload.bind(s3));

export const uploadImageToS3 = (userName: string, imageName: string, imageReadStream: any): Promise<UploadResult> => {
	const passthrough = new PassThrough();
	imageReadStream.pipe(passthrough);

	const data = {
		Bucket: config.s3.bucket,
		Key: 'uploaded/avatar/' + userName + '/' + imageName,
		Body: passthrough
	};
	return uploadFile(data);
};