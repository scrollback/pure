/* @flow */

import React, { PropTypes, Component } from 'react';
import ImageUploadHelper from '../../../modules/image-upload/ImageUploadHelper';

type UploadResult = {
	url: ?string;
	thumbnails: ?Array<string>;
}

type Props = {
	photo: any;
	component: ReactClass<*>;
	successDelay?: number;
	autoStart?: boolean;
	onUploadClose?: Function;
	onUploadSuccess?: (result: UploadResult) => void;
	onUploadError?: (e: Error) => void;
	uploadOptions: any;
}

type State = {
	upload: ?ImageUploadHelper;
	status: 'idle' | 'loading' | 'finished' | 'error';
}

export default class ImageUploadContainer extends Component<void, Props, State> {
	static propTypes = {
		photo: PropTypes.any.isRequired,
		component: PropTypes.any.isRequired,
		successDelay: PropTypes.number,
		autoStart: PropTypes.bool,
		onUploadClose: PropTypes.func,
		onUploadSuccess: PropTypes.func,
		onUploadError: PropTypes.func,
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
		const { photo, successDelay } = this.props;
		const filename = photo.name ? photo.name.replace(/\s+/g, ' ') : 'image';
		const upload = ImageUploadHelper.create({ ...this.props.uploadOptions, filename });

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

			if (successDelay) {
				await new Promise(resolve => setTimeout(resolve, successDelay));
			}

			if (this.props.onUploadSuccess) {
				this.props.onUploadSuccess(result);
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

			if (this.props.onUploadError) {
				this.props.onUploadError(e);
			}
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
