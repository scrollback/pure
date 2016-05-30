/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from './AppText';
import Link from './Link';
import { buildLink } from '../../../../lib/URL';
import { format, isEmoji } from '../../../../lib/Smiley';

const {
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	emojiOnly: {
		textAlign: 'center',
		fontSize: 32,
		lineHeight: 48,
	},
});

type Props = {
	text: string;
	onOpenLink?: Function;
	style?: any;
}

export default class RichText extends Component<void, Props, void> {
	static propTypes = {
		text: PropTypes.string.isRequired,
		onOpenLink: PropTypes.func,
		style: AppText.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	setNativeProps(nativeProps: any) {
		this._root.setNativeProps(nativeProps);
	}

	_root: Object;

	render() {
		const { onOpenLink } = this.props;

		const textWithEmoji = format(this.props.text);

		if (isEmoji(textWithEmoji)) {
			return (
				<AppText
					{...this.props}
					style={[ styles.emojiOnly, this.props.style ]}
					ref={c => (this._root = c)}
				>
					{textWithEmoji}
				</AppText>
			);
		} else {
			return (
				<AppText
					{...this.props}
					style={[ styles.text, this.props.style ]}
					ref={c => (this._root = c)}
				>
					{textWithEmoji.split('\n').map((text, index, arr) => {
						return ([
							text.split(' ').map((inner, i) => {
								let t = inner;

								const items = [];

								const key = 'inner-' + index + '-' + i;

								// Strip out ending punctuations
								let punctuation = '';

								const matches = t.match(/[\.,\?!:;]+$/);

								if (matches) {
									punctuation = matches[0];
									t = t.substring(0, t.length - punctuation.length);
								}

								if (/^@[a-z0-9\-]{3,}$/.test(t)) {
									// a mention
									items.push(<Link onOpen={onOpenLink} key={key}>{t}</Link>);
								} else if (/^#\S{2,}$/.test(t)) {
									// a hashtag
									items.push(<Link onOpen={onOpenLink} key={key}>{t}</Link>);
								} else {
									const url = buildLink(t);

									if (url !== null) {
										items.push(
											<Link
												onOpen={onOpenLink}
												key={key}
												url={url}
											>
												{t}
											</Link>
										);
									} else {
										return t + punctuation + ' ';
									}
								}

								items.push(punctuation + ' ');

								return items;
							}),
							index !== (arr.length - 1) ? '\n' : '',
						]);
					})}
				</AppText>
			);
		}
	}
}
