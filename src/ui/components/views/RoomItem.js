/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import Colors from '../../Colors';
import AppText from './AppText';
import ListItem from './ListItem';
import Icon from './Icon';
import Modal from './Modal';
import Share from '../../modules/Share';
import { convertRouteToURL } from '../../../lib/Route';
import { config } from '../../../core-client';

const {
	StyleSheet,
	TouchableOpacity,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	item: {
		flex: 1,
		justifyContent: 'center',
		paddingHorizontal: 16,
	},
	title: {
		color: Colors.darkGrey,
		fontWeight: 'bold',
	},
	expand: {
		margin: 20,
		color: Colors.fadedBlack,
	},
});

type Props = {
	room: {
		id: string;
		name: string;
	};
	onSelect: Function;
}

export default class RoomItem extends Component<void, Props, void> {
	static propTypes = {
		room: PropTypes.shape({
			id: PropTypes.string.isRequired,
			name: PropTypes.string,
		}),
		onSelect: PropTypes.func,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	_handleShowMenu: Function = () => {
		const { room } = this.props;

		const options = [];
		const actions = [];

		options.push('Share group');
		actions.push(() => {
			Share.shareItem('Share group', config.server.protocol + '//' + config.server.host + convertRouteToURL({
				name: 'room',
				props: {
					room: room.id,
				},
			}));
		});

		Modal.showActionSheetWithOptions({ options }, index => actions[index]());
	};

	_handlePress: Function = () => {
		if (this.props.onSelect) {
			this.props.onSelect(this.props.room);
		}
	};

	render() {
		const { room } = this.props;

		return (
			<ListItem {...this.props} onPress={this._handlePress}>
				<View style={styles.item}>
					<AppText style={styles.title}>{room.name || 'Loading…'}</AppText>
				</View>

				<TouchableOpacity onPress={this._handleShowMenu}>
					<Icon
						name='expand-more'
						style={styles.expand}
						size={20}
					/>
				</TouchableOpacity>
			</ListItem>
		);
	}
}
