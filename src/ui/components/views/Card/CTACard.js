/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import template from 'lodash/template';
import Card from './Card';
import Share from '../../../modules/Share';
import type { Room, User } from '../../../../lib/schemaTypes';

const {
	Image,
	Linking,
	StyleSheet,
	TouchableOpacity,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		height: 180,
	},
	touchable: {
		flex: 1,
	},
	cover: {
		flex: 1,
		resizeMode: 'cover',
	},
});

type State = {
	image: ?string;
}

type Props = {
	user: User;
	room: ?Room;
	data: ?{
		id: string;
		image?: string;
		images?: Array<string>;
		title: string;
		content: ?string;
		url: ?string;
		type: 'share' | 'view';
	};
	style?: any;
}

export default class CTACard extends Component<void, Props, State> {
	static propTypes = {
		room: PropTypes.object,
		user: PropTypes.object.isRequired,
		data: PropTypes.shape({
			id: PropTypes.string.isRequired,
			image: PropTypes.string,
			images: PropTypes.arrayOf(PropTypes.string),
			title: PropTypes.string.isRequired,
			content: PropTypes.string,
			url: PropTypes.string,
			type: PropTypes.oneOf([ 'share', 'view' ]),
		}),
		style: Card.propTypes.style,
	};

	state: State = {
		image: null,
	};

	componentWillMount() {
		this._setImage(this.props);
	}

	componentWillReceiveProps(nextProps: Props) {
		this._setImage(nextProps);
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	componentWillUnmount() {
		if (this._subscription) {
			this._subscription.unsubscribe();
			this._subscription = null;
		}
	}

	_subscription: ?Subscription;

	_checkImageExists = (url: string): Promise<boolean> => {
		return new Promise(resolve => {
			const req = new XMLHttpRequest();

			req.open('HEAD', url, true); // Avoid doing a GET request to prevent OOM
			req.onreadystatechange = () => {
				if (req.readyState === req.DONE) {
					resolve(req.status === 200);
				}
			};
			req.send();
		});
	};

	_checkImageList = function(urls: Array<string>): Observable<string> {
		return new Observable(observer => {
			const promises = urls.map(async url => {
				const exists = await this._checkImageExists(url);
				return {
					url,
					exists,
				};
			});

			Promise
				.all(promises)
				.then(
					results => {
						results.forEach(result => {
							if (result.exists) {
								observer.next(result.url);
							}
						});
						observer.complete();
					},
					e => observer.error(e)
				);
		});
	}

	_setImage = (props: Props) => {
		const {
			room,
			user,
			data,
		} = props;

		if (data) {
			let images;

			if (data.images) {
				images = data.images;
			} else if (data.image) {
				images = [ data.image ];
			} else {
				images = [];
			}

			images = images.map(url => template(url)({ room, user }));

			let done;

			this._subscription = this._checkImageList(images).subscribe({
				next: image => {
					if (done) {
						return;
					}
					done = true;
					this.setState({
						image,
					});
				},
			});
		}
	};

	_handleShare = () => {
		const {
			data,
			room,
			user,
		} = this.props;

		if (data && data.content) {
			try {
				Share.shareItem(data.title ? template(data.title)({ room, user }) : 'Share…', template(data.content)({ room, user }));
			} catch (e) {
				// ignore
			}
		}
	};

	_handleView = async () => {
		const {
			room,
			user,
			data,
		} = this.props;

		if (data && data.url) {
			const link = template(data.url)({ room, user });

			try {
				const canOpen = await Linking.canOpenURL(link);

				if (canOpen) {
					await Linking.openURL(link);
				}
			} catch (e) {
				// ignore
			}
		}
	};

	_handlePress = () => {
		const {
			data,
		} = this.props;

		if (data) {
			switch (data.type) {
			case 'share':
				this._handleShare();
				break;
			case 'view':
				this._handleView();
				break;
			}
		}
	};

	render() {
		if (!this.state.image) {
			return null;
		}

		return (
			<Card {...this.props} style={[ styles.container, this.props.style ]}>
				<TouchableOpacity style={styles.touchable} onPress={this._handlePress}>
					<Image
						style={styles.cover}
						source={{ uri: this.state.image }}
					/>
				</TouchableOpacity>
			</Card>
		);
	}
}
