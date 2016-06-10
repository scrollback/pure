/* @flow */

import React, { PropTypes, Component } from 'react';
import { v4 } from 'node-uuid';
import ImageUploadHelper from '../../../modules/image-upload/ImageUploadHelper';

type UploadResult = {
	id: string;
	result: {
		url: ?string;
		thumbnail: ?string;
	};
}

type Props = {
	photo: any;
	component: ReactClass;
	autoStart?: boolean;
	onUploadClose?: Function;
	onUploadFinish?: (result: UploadResult) => void;
}

type State = {
	id: ?string;
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
	};

	state: State = {
		id: null,
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
		const id = v4();
		const upload = ImageUploadHelper.create({
			uploadType: 'content',
			generateThumb: true,
			textId: id,
		});

		this.setState({
			id,
			upload,
			status: 'loading',
		});

		try {
			const result = await upload.send(photo.name ? photo.name.replace(/\s+/g, ' ') : 'image', {
				uri: photo.uri,
				type: 'image/' + (photo.name && photo.name.split('.').pop() || 'jpg'),
			});

			if (this.props.onUploadFinish) {
				this.props.onUploadFinish({ id, result });
			}

			this.setState({
				id: null,
				upload: null,
				status: 'finished',
			});
		} catch (e) {
			this.setState({
				id: null,
				upload: null,
				status: 'error',
			});
		}
	};

	_cancelUpload = () => {
		if (this.state.upload) {
			this.state.upload.cancel();
			this.setState({
				id: null,
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
