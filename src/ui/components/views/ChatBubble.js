/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import Colors from '../../Colors';
import AppText from './AppText';
import RichText from './RichText';

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	containerLeft: {
		alignItems: 'flex-start'
	},
	containerRight: {
		alignItems: 'flex-end'
	},
	bubble: {
		backgroundColor: Colors.white,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 3
	},
	bubbleLeft: {
		marginLeft: 8
	},
	bubbleRight: {
		backgroundColor: '#ddd',
		marginRight: 8
	},
	text: {
		color: Colors.darkGrey,
		paddingHorizontal: 4
	},
	triangle: {
		width: 0,
		height: 0,
		backgroundColor: 'transparent',
		borderStyle: 'solid',
		borderLeftWidth: 8,
		borderRightWidth: 12,
		borderBottomWidth: 14,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
	},
	triangleLeft: {
		left: 1,
		borderBottomColor: '#fff',
		transform: [
			{ rotate: '12deg' }
		]
	},
	triangleRight: {
		right: 8,
		borderBottomColor: '#ddd',
	},
	triangleContainer: {
		position: 'absolute',
		height: 12,
		width: 10,
		bottom: 0,
	},
	triangleContainerLeft: {
		left: 0,
	},
	triangleContainerRight: {
		right: 0
	},
	author: {
		fontSize: 12,
		lineHeight: 18,
		paddingBottom: 4,
		paddingHorizontal: 4,
		opacity: 0.5,
	}
});

type Props = {
	body: ?string;
	creator: string;
	type: 'left' | 'right';
	showAuthor?: boolean;
	showArrow?: boolean;
	onPress?: Function;
	children?: Element;
	style?: any;
}

type DefaultProps = {
	showAuthor: boolean;
	showArrow: boolean;
}

export default class ChatBubble extends Component<DefaultProps, Props, void> {
	static propTypes = {
		body: PropTypes.string,
		creator: PropTypes.string.isRequired,
		type: PropTypes.oneOf([ 'left', 'right' ]),
		showAuthor: PropTypes.bool,
		showArrow: PropTypes.bool,
		onPress: PropTypes.func,
		children: PropTypes.node,
		style: View.propTypes.style
	};

	static defaultProps = {
		showAuthor: false,
		showArrow: true
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	setNativeProps(nativeProps: any) {
		this._root.setNativeProps(nativeProps);
	}

	_root: Object;

	render() {
		const { body, creator, type, showArrow } = this.props;

		const right = type === 'right';

		return (
			<View style={[ right ? styles.containerRight : styles.containerLeft, this.props.style ]} ref={c => (this._root = c)}>
				{right || !showArrow ? null :
					<View style={[ styles.triangleContainer, styles.triangleContainerLeft ]}>
						<View style={[ styles.triangle, styles.triangleLeft ]} />
					</View>
				}

				<View style={[ styles.bubble, right ? styles.bubbleRight : styles.bubbleLeft ]}>
					{this.props.showAuthor ?
						<AppText style={styles.author}>{creator}</AppText> :
						null
					}

					{this.props.children}

					{body ?
						<RichText text={body} style={styles.text} /> :
						null
					}
				</View>

				{right && showArrow ?
					<View style={[ styles.triangleContainer, styles.triangleContainerRight ]}>
						<View style={[ styles.triangle, styles.triangleRight ]} />
					</View> :
					null
				}
			</View>
		);
	}
}
