/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import ActionSheet from '../Core/ActionSheet';
import ActionSheetItem from '../Core/ActionSheetItem';
import { TAG_POST_HIDDEN } from '../../../../lib/Constants';
import type { Text } from '../../../../lib/schemaTypes';

const {
	Clipboard,
	Linking,
	ToastAndroid,
} = ReactNative;

type Props = {
	text: Text;
	user: string;
	quoteMessage: Function;
	replyToMessage: Function;
	isUserAdmin: boolean;
	hideText: Function;
	unhideText: Function;
	banUser: Function;
	unbanUser: Function;
};

export default class ChatItem extends Component<void, Props, void> {
	static propTypes = {
		text: PropTypes.object.isRequired,
		user: PropTypes.string.isRequired,
		quoteMessage: PropTypes.func.isRequired,
		replyToMessage: PropTypes.func.isRequired,
		isUserAdmin: PropTypes.bool.isRequired,
		hideText: PropTypes.func.isRequired,
		unhideText: PropTypes.func.isRequired,
		banUser: PropTypes.func.isRequired,
		unbanUser: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_copyToClipboard: Function = text => {
		Clipboard.setString(text);
		ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
	};

	_handleOpenImage: Function = () => {
		const { text } = this.props;

		if (text.meta) {
			const { photo } = text.meta;

			Linking.openURL(photo.url);
		}
	};

	_handleCopyImageLink: Function = () => {
		const { text } = this.props;

		if (text.meta) {
			const { photo } = text.meta;

			this._copyToClipboard(photo.url);
		}
	};

	_handleCopyMessage: Function = () => {
		this._copyToClipboard(this.props.text.body);
	};

	_handleQuoteMessage: Function = () => {
		this.props.quoteMessage(this.props.text);
	};

	_handleReplyToMessage: Function = () => {
		this.props.replyToMessage(this.props.text);
	};

	render() {
		const {
			text,
			user,
			isUserAdmin,
		} = this.props;

		const hidden = text.tags && text.tags.indexOf(TAG_POST_HIDDEN) > -1;

		return (
			<ActionSheet {...this.props}>
				{text.meta && text.meta.photo ? [
					<ActionSheetItem key='open-image' onPress={this._handleOpenImage}>
						Open image in browser
					</ActionSheetItem>,
					<ActionSheetItem key='copy-imagelink' onPress={this._handleCopyImageLink}>
						Copy image link
					</ActionSheetItem>,
				] : [
					<ActionSheetItem key='copy-text' onPress={this._handleCopyMessage}>
						Copy message text
					</ActionSheetItem>,
					<ActionSheetItem key='quote-text' onPress={this._handleQuoteMessage}>
						Quote message
					</ActionSheetItem>,
				]}

				{user !== text.creator ?
					<ActionSheetItem onPress={this._handleReplyToMessage}>
						{'Reply to @' + text.creator}
					</ActionSheetItem> : null
				}

				{isUserAdmin ?
					hidden ?
						<ActionSheetItem onPress={this.props.unhideText}>
							Unhide message
						</ActionSheetItem> :
						<ActionSheetItem onPress={this.props.hideText}>
							Hide message
						</ActionSheetItem> : null
				}
			</ActionSheet>
		);
	}
}
