/* @flow */

import { bus } from '../../core-client';

type UploadOptions = {
	filename: string;
	uploadType: 'content';
	generateThumb?: boolean;
	contentId: string;
} | {
	filename: string;
	uploadType: 'avatar';
	generateThumb?: boolean;
}

type UploadParams = {
	request_url: string;
	original: string;
	thumbnails: Array<string>;
	policy: {
		key: string;
		acl: string;
		policy: string;
		success_action_status: string;
		'x-amz-algorithm': string;
		'x-amz-credential': string;
		'x-amz-date': string;
		'x-amz-signature': string;
	}
}

type UploadResult = {
	url: ?string;
	thumbnails: ?Array<string>;
}

export default class ImageUploadHelper {
	static create(options: UploadOptions) {
		return new ImageUploadHelper(options);
	}

	_uploadParams: Promise<UploadParams>;
	_options: UploadOptions;
	_request: XMLHttpRequest;

	constructor(options: UploadOptions) {
		this._options = options;
		this._uploadParams = new Promise((resolve, reject) => {
			bus.emit('socket/get', { type: 's3/getPolicy', data: options }, (err, res) => {
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

	_createFormData(policy: { [key: string]: any }): FormData {
		const formData = new FormData();

		for (const field in policy) {
			formData.append(field, policy[field]);
		}

		return formData;
	}

	_pollThumbnail(thumbnail: string): Promise<string> {
		const TIMEOUT_INTERVAL = 1500;

		return new Promise((resolve, reject) => {
			const startTime = Date.now();

			let thumbTimer;

			const checkThumb = () => {
				const onError = () => {
					if (Date.now() - startTime > TIMEOUT_INTERVAL * 10) {
						reject(new Error('ERR_THUMBNAIL_TIMEOUT'));
					} else {
						thumbTimer = setTimeout(checkThumb, TIMEOUT_INTERVAL);
					}
				};
				const clearTimer = () => {
					if (thumbTimer) {
						clearTimeout(thumbTimer);
					}
				};

				const req = new XMLHttpRequest();

				req.open('HEAD', thumbnail, true); // Avoid doing a GET request to prevent OOM
				req.onreadystatechange = () => {
					if (req.readyState === req.DONE) {
						clearTimer();

						if (req.status < 300) {
							resolve(thumbnail);
						} else {
							onError();
						}
					}
				};
				req.send();
			};

			setTimeout(checkThumb, TIMEOUT_INTERVAL);
		});
	}

	_sendRequest(baseUrl: string, formData: FormData): Promise<string> {
		const request = new XMLHttpRequest();

		const requestPromise = new Promise((resolve, reject) => {
			request.onerror = () => reject(new Error(`${request.responseText}: ${request.status}`));
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
		const uploadParams = await this._uploadParams;
		const {
			generateThumb,
		} = this._options;
		const {
			request_url,
			original,
			thumbnails,
			policy,
		} = uploadParams;

		const formData = this._createFormData(policy);

		formData.append('file', file);

		await this._sendRequest(request_url, formData);

		if (generateThumb) {
			if (thumbnails) {
				await this._pollThumbnail(thumbnails[0]);
				await this._pollThumbnail(thumbnails[thumbnails.length - 1]);
			}
		}

		return {
			url: original,
			thumbnails,
		};
	}
}
