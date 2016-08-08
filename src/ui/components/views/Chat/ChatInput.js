/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import ImageChooser from 'react-native-image-chooser';
import { v4 } from 'node-uuid';
import Icon from '../Core/Icon';
import GrowingTextInput from '../Core/GrowingTextInput';
import TouchFeedback from '../Core/TouchFeedback';
import ChatSuggestionsContainer from '../../containers/ChatSuggestionsContainer';
import ImageUploadContainer from '../../containers/ImageUploadContainer';
import ImageUploadChat from '../ImageUpload/ImageUploadChat';
import Colors from '../../../Colors';
import type { Text } from '../../../../lib/schemaTypes';

const {
	StyleSheet,
	View,
	PixelRatio,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'stretch',
		backgroundColor: Colors.white,
		borderColor: Colors.underlay,
		borderTopWidth: 1 / PixelRatio.get(),
		elevation: 4,
	},
	inputContainer: {
		flex: 1,
		paddingHorizontal: 16,
	},
	input: {
		paddingVertical: 8,
		margin: 0,
		backgroundColor: 'transparent',
		color: Colors.black,
		fontSize: 14,
		lineHeight: 21,
	},
	iconContainer: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	icon: {
		color: Colors.fadedBlack,
		margin: 17,
	},
});

type Props = {
	room: string;
	thread: string;
	user: string;
	sendMessage: Function;
}

type State = {
	nextId: string;
	text: string;
	query: ?string;
	cursor: number;
	photo: ?{
		uri: string;
		size: number;
		name: string;
		height: number;
		width: number;
	};
}

export default class ChatInput extends Component<void, Props, State> {
	static propTypes = {
		room: PropTypes.string.isRequired,
		thread: PropTypes.string.isRequired,
		user: PropTypes.string.isRequired,
		sendMessage: PropTypes.func.isRequired,
	};

	state: State = {
		nextId: v4(),
		text: '',
		query: null, // set to empty string when typing starts to render the component which makes query for texts
		photo: null,
		cursor: -1,
	};

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	setQuotedText: Function = (text: Text) => {
		this._computeAndSetText({
			replyTo: text.creator,
			quotedText: text.body,
		});
	};

	setReplyTo: Function = (text: Text) => {
		this._computeAndSetText({
			replyTo: text.creator,
		});
	};

	_input: Object;

	_sendMessage = () => {
		const {
			room,
			thread,
			user,
		} = this.props;

		this.props.sendMessage({
			body: this.state.text,
			room,
			thread,
			user,
		});

		this.setState({
			text: '',
		});
	};

	_handleUploadImage = async () => {
		try {
			this.setState({
				photo: null,
			});

			const photo = await ImageChooser.pickImage();

			this.setState({
				photo,
			});
		} catch (e) {
			// Do nothing
		}
	};

	_handleUploadFinish = (result: { url: ?string; thumbnail: ?string; }) => {
		const {
			room,
			thread,
			user,
		} = this.props;
		const {
			photo,
		} = this.state;

		if (!result.url || !photo) {
			return;
		}

		const { height, width, name } = photo;
		const aspectRatio = height / width;

		this.props.sendMessage({
			id: this.state.nextId,
			room,
			thread,
			user,
			body: `${photo.name}: ${result.url}`,
			meta: {
				photo: {
					height,
					width,
					title: name,
					url: result.url,
					thumbnail_height: Math.min(480, width) * aspectRatio,
					thumbnail_width: Math.min(480, width),
					thumbnail_url: result.thumbnail,
					type: 'photo',
				},
			},
		});

		setTimeout(() => this._handleUploadClose(), 500);
	};

	_handleUploadClose = () => {
		this.setState({
			nextId: v4(),
			photo: null,
		});
	};

	_handleSuggestionSelect = (user: { id: string }) => {
		const {
			text,
			cursor,
		} = this.state;

		let message;

		if (cursor === -1) {
			message = text + ' @' + user.id + ' ';
		} else {
			let beginning = text.slice(0, cursor);
			beginning = beginning.slice(0, beginning.lastIndexOf('@'));
			message = beginning + '@' + user.id + ' ' + text.slice(cursor);
		}

		this.setState({
			text: message,
			query: '',
		});
	};

	_handleChangeText = (text: string) => {
		this.setState({
			text,
		});
	};

	_handleChangeSelection = (e: any) => {
		const { selection } = e.nativeEvent;

		if (selection && selection.start === selection.end) {
			const text = this.state.text.substring(0, selection.start);

			// match when there's a @ towards the end of the text
			// e.g. - '@', 'hey @', 'hey @s'
			if (/(\s+@|^@)[a-z0-9]?[^@^\s]*$/.test(text)) {
				const query = text.substring(text.lastIndexOf('@'));
				this.setState({
					cursor: selection.start,
					query,
				});
				return;
			}
		}

		this.setState({
			cursor: -1,
			query: '',
		});
	};

	_computeAndSetText = (opts: { quotedText?: string; replyTo?: string;}) => {
		const quotedText = opts.quotedText ? opts.quotedText.replace(/\n/g, ' ') : null;

		let newValue = this.state.text;

		if (quotedText) {
			if (newValue) {
				newValue += '\n\n';
			}

			newValue += '> ' + (opts.replyTo ? '@' + opts.replyTo + ' - ' : '') + quotedText + '\n\n';
		} else if (opts.replyTo) {
			if (newValue) {
				newValue += ' ';
			}

			newValue += `@${opts.replyTo} `;
		}

		this.setState({
			text: newValue,
		}, () => this._input.focusKeyboard());
	};

	render() {
		return (
			<View {...this.props}>
				{typeof this.state.query === 'string' ?
					<ChatSuggestionsContainer
						user={this.props.user}
						thread={this.props.thread}
						prefix={this.state.query}
						onSelect={this._handleSuggestionSelect}
					/> : null
				}

				<View style={styles.container}>
					<GrowingTextInput
						ref={c => (this._input = c)}
						value={this.state.text}
						onChangeText={this._handleChangeText}
						onSelectionChange={this._handleChangeSelection}
						underlineColorAndroid='transparent'
						placeholder='Write a message…'
						autoCapitalize='sentences'
						numberOfLines={7}
						style={styles.inputContainer}
						inputStyle={styles.input}
					/>

					<TouchFeedback
						borderless
						onPress={this.state.text ? this._sendMessage : this._handleUploadImage}
					>
						<View style={styles.iconContainer}>
							<Icon
								name={this.state.text ? 'send' : 'image'}
								style={styles.icon}
								size={24}
							/>
						</View>
					</TouchFeedback>
				</View>

				{this.state.photo ?
					<ImageUploadContainer
						component={ImageUploadChat}
						photo={this.state.photo}
						onUploadClose={this._handleUploadClose}
						onUploadFinish={this._handleUploadFinish}
						uploadOptions={{
							uploadType: 'content',
							generateThumb: true,
							textId: this.state.nextId,
						}}
					/> : null
				}
			</View>
		);
	}
}
