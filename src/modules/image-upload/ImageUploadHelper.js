/* @flow */

import { bus } from '../../core-client';

type UploadOptions = {
	uploadType: 'content';
	generateThumb?: boolean;
	textId: string;
}

type UploadPolicy = {
	keyPrefix: string;
	bucket: string;
	acl: string;
	policy: string;
	'x-amz-algorithm': string;
	'x-amz-credential': string;
	'x-amz-date': string;
	'x-amz-signature': string;
}

type UploadResult = {
	url: ?string;
	thumbnail: ?string;
}

export default class ImageUploadHelper {
	static create(options: UploadOptions) {
		return new ImageUploadHelper(options);
	}

	_policy: Promise<UploadPolicy>;
	_options: UploadOptions;
	_request: XMLHttpRequest;

	constructor(options: UploadOptions) {
		this._options = options;
		this._policy = new Promise((resolve, reject) => {
			bus.emit('s3/getPolicy', options, (err, res) => {
				if (err || !(res && res.response)) {
					reject(err);
				} else if (res.response && res.response.error) {
					reject(res.response.error);
				} else {
					resolve(res.response);
				}
			});
		});
	}

	_createFormData(policy: UploadPolicy): FormData {
		const formData = new FormData();
		const fields = [
			'acl', 'policy', 'x-amz-algorithm', 'x-amz-credential',
			'x-amz-date', 'x-amz-signature',
		];

		for (const field of fields) {
			formData.append(field, policy[field]);
		}

		return formData;
	}

	_pollThumbnail(thumbnail: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const startTime = Date.now();

			let thumbTimer;

			const checkThumb = () => {
				const onError = () => {
					if (Date.now() - startTime > 15000) {
						reject(new Error('ERR_THUMBNAIL_TIMEOUT'));
					} else {
						thumbTimer = setTimeout(checkThumb, 1500);
					}
				};
				const clearTimer = () => {
					if (thumbTimer) {
						clearTimeout(thumbTimer);
					}
				};

				const req = new XMLHttpRequest();

				req.open('HEAD', thumbnail, true); // Avoid doing a GET request to prevent OOM
				req.onload = () => {
					clearTimer();

					if (req.status < 300) {
						resolve(thumbnail);
					} else {
						onError();
					}
				};
				req.onerror = () => {
					clearTimer();
					onError();
				};
				req.send();
			};

			setTimeout(checkThumb, 1500);
		});
	}

	_sendRequest(baseUrl: string, formData: FormData): Promise<string> {
		const request = new XMLHttpRequest();

		const requestPromise = new Promise((resolve, reject) => {
			request.onerror = () => reject(new Error('ERR_UPLOAD_FAIL'));
			request.onabort = () => reject(new Error('ERR_UPLOAD_ABORTED'));
			request.onload = () => {
				if (request.status === 201) {
					resolve(request.responseText);
				} else {
					reject(new Error(`${request.responseText}: ${request.status}`));
				}
			};
		});

		request.open('POST', baseUrl, true);
		request.send(formData);

		this._request = request;

		return requestPromise;
	}

	cancel() {
		if (this._request) {
			this._request.abort();
		}
	}

	async send(name: string, file: File | { uri: string; type: string; }): Promise<UploadResult> {
		const policy = await this._policy;
		const {
			uploadType,
			generateThumb,
		} = this._options;
		const {
			keyPrefix,
			bucket,
		} = policy;
		const baseUrl = 'https://' + bucket + '.s3.amazonaws.com/';
		const filename = name.replace(/\s+/g, ' ');

		let key = keyPrefix,
			url;

		switch (uploadType) {
		case 'avatar':
		case 'banner':
			key += 'original.' + filename.split('.').pop();
			url = baseUrl + key;
			break;
		case 'content':
			key += '1/' + filename;
			url = baseUrl + keyPrefix + '1/' + encodeURIComponent(filename);
			break;
		}

		const formData = this._createFormData(policy);

		formData.append('success_action_status', '201');
		formData.append('key', key);
		formData.append('file', file);

		await this._sendRequest(baseUrl, formData);

		let thumbnail;

		if (generateThumb) {
			let thumbnailUrl = baseUrl + keyPrefix.replace(/^uploaded/, 'generated');

			switch (uploadType) {
			case 'avatar':
			case 'banner':
				thumbnailUrl += '256x256.jpg';
				break;
			case 'content':
				thumbnailUrl += '1/480x960.jpg';
				break;
			}

			if (thumbnailUrl) {
				thumbnail = await this._pollThumbnail(thumbnailUrl);
			}
		}

		return {
			url,
			thumbnail,
		};
	}
}
