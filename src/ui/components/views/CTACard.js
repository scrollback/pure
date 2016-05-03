/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import template from 'lodash/template';
import Card from './Card';
import Share from '../../modules/Share';
import type { Room, User } from '../../../lib/schemaTypes';

const {
	Image,
	Linking,
	StyleSheet,
	TouchableOpacity,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	cover: {
		height: 180,
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
		image: string;
		title: string;
		content: ?string;
		url: ?string;
		type: 'share' | 'view';
	}
}

export default class CTACard extends Component<void, Props, State> {
	static propTypes = {
		room: PropTypes.object,
		user: PropTypes.object.isRequired,
		data: PropTypes.shape({
			id: PropTypes.string.isRequired,
			image: PropTypes.string.isRequired,
			title: PropTypes.string.isRequired,
			content: PropTypes.string,
			url: PropTypes.string,
			type: PropTypes.oneOf([ 'share', 'view' ]),
		}),
	};

	state: State = {
		image: null,
	};

	componentWillReceiveProps(nextProps: Props) {
		const {
			data,
			room,
			user,
		} = nextProps;

		if (data && data.image) {
			this.setState({
				image: template(data.image)({ room, user }),
			});
		}
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
	}

	_handleShare: Function = () => {
		const {
			data,
			room,
			user,
		} = this.props;

		if (data && data.content) {
			try {
				Share.shareItem(data.title || '', template(data.content)({ room, user }));
			} catch (e) {
				// ignore
			}
		}
	};

	_handleView: Function = async () => {
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

	_handlePress: Function = () => {
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
			<Card {...this.props}>
				<TouchableOpacity style={styles.container} onPress={this._handlePress}>
					<Image style={styles.cover} source={{ uri: this.state.image }} />
				</TouchableOpacity>
			</Card>
		);
	}
}
