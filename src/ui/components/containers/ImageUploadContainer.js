/* @flow */

import React, { PropTypes, Component } from 'react';
import ImageUploadHelper from '../../../modules/image-upload/ImageUploadHelper';
import type { UploadOptions } from '../../../modules/image-upload/ImageUploadHelper';

type UploadResult = {
	url: ?string;
	thumbnail: ?string;
}

type Props = {
	photo: any;
	component: ReactClass;
	autoStart?: boolean;
	onUploadClose?: Function;
	onUploadFinish?: (result: UploadResult) => void;
	uploadOptions: UploadOptions;
}

type State = {
	upload: ?ImageUploadHelper;
	status: 'idle' | 'loading' | 'finished' | 'error';
}

export default class ImageUploadContainer extends Component<void, Props, State> {
	static propTypes = {
		photo: PropTypes.any.isRequired,
		component: PropTypes.any.isRequired,
		autoStart: PropTypes.bool,
		onUploadClose: PropTypes.func,
		onUploadFinish: PropTypes.func,
		uploadOptions: PropTypes.object.isRequired,
	};

	state: State = {
		upload: null,
		status: 'idle',
	};

	componentWillMount() {
		if (this.props.autoStart) {
			this._startUpload();
		}
	}

	componentWillUnmount() {
		this._closeUpload();
	}

	_startUpload = async () => {
		const { photo } = this.props;
		const upload = ImageUploadHelper.create(this.props.uploadOptions);

		this.setState({
			upload,
			status: 'loading',
		});

		try {
			const ext = photo.name && photo.name.split('.').pop() || 'jpg';

			const result = await upload.send(photo.name ? photo.name.replace(/\s+/g, ' ') : 'image', {
				uri: photo.uri,
				type: 'image/' + (ext === 'jpg' ? 'jpeg' : ext),
			});

			if (this.props.onUploadFinish) {
				this.props.onUploadFinish(result);
			}

			this.setState({
				upload: null,
				status: 'finished',
			});
		} catch (e) {
			this.setState({
				upload: null,
				status: 'error',
			});
		}
	};

	_cancelUpload = () => {
		if (this.state.upload) {
			this.state.upload.cancel();
			this.setState({
				upload: null,
				status: 'idle',
			});
		}
	};

	_closeUpload = () => {
		this._cancelUpload();

		if (this.props.onUploadClose) {
			this.props.onUploadClose();
		}
	};

	render() {
		const ChildComponent = this.props.component;

		return (
			<ChildComponent
				photo={this.props.photo}
				status={this.state.status}
				startUpload={this._startUpload}
				cancelUpload={this._cancelUpload}
				closeUpload={this._closeUpload}
			/>
		);
	}
}
