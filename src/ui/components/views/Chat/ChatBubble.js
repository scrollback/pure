/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import Colors from '../../../Colors';
import AppText from '../Core/AppText';
import RichText from '../Core/RichText';

const {
	StyleSheet,
	View,
} = ReactNative;

const LEFT_BUBBLE_COLOR = Colors.white;
const RIGHT_BUBBLE_COLOR = '#ddd';

const styles = StyleSheet.create({
	containerLeft: {
		alignItems: 'flex-start',
	},
	containerRight: {
		alignItems: 'flex-end',
	},
	bubble: {
		backgroundColor: LEFT_BUBBLE_COLOR,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 3,
	},
	bubbleLeft: {
		marginLeft: 8,
	},
	bubbleRight: {
		backgroundColor: RIGHT_BUBBLE_COLOR,
		marginRight: 8,
	},
	text: {
		color: Colors.darkGrey,
		fontSize: 14,
		lineHeight: 21,
		paddingHorizontal: 4,
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
		left: 0,
		borderBottomColor: LEFT_BUBBLE_COLOR,
		transform: [
			{ rotate: '-180deg' },
		],
	},
	triangleRight: {
		right: 8,
		borderBottomColor: RIGHT_BUBBLE_COLOR,
	},
	triangleContainer: {
		position: 'absolute',
		height: 12,
		width: 10,
	},
	triangleContainerLeft: {
		left: 0,
		top: 0,
	},
	triangleContainerRight: {
		right: 0,
		bottom: 0,
	},
	author: {
		fontSize: 12,
		paddingBottom: 4,
		paddingHorizontal: 4,
		opacity: 0.5,
	},
});

type Props = {
	body: ?string;
	creator: string;
	type: 'left' | 'right';
	showAuthor?: boolean;
	showArrow?: boolean;
	onPress?: Function;
	children?: React.Element;
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
		style: View.propTypes.style,
	};

	static defaultProps = {
		showAuthor: false,
		showArrow: true,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
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
				<View style={[ styles.bubble, right ? styles.bubbleRight : styles.bubbleLeft ]}>
					{this.props.showAuthor ?
						<AppText style={styles.author}>{creator}</AppText> :
						null
					}

					{this.props.children}

					{body ?
						<RichText
							selectable
							text={body}
							style={styles.text}
						/> :
						null
					}
				</View>

				{right || !showArrow ? null :
					<View style={[ styles.triangleContainer, styles.triangleContainerLeft ]}>
						<View style={[ styles.triangle, styles.triangleLeft ]} />
					</View>
				}


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
