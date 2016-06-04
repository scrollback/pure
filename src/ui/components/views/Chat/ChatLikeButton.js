/* @flow */

import React, { Component, PropTypes } from 'react';
import {
	StyleSheet,
	TouchableOpacity,
} from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from '../Core/AppText';
import Icon from '../Core/Icon';
import Colors from '../../../Colors';
import { ROLE_UPVOTE } from '../../../../lib/Constants';
import type { Text, TextRel } from '../../../../lib/schemaTypes';

type Props = {
	text: Text;
	textrel: TextRel;
	unlikeText: Function;
	likeText: Function;
}

type State = {
	likes: number;
}

const FADED_GREY = '#b2b2b2';

const styles = StyleSheet.create({
	icon: {
		color: FADED_GREY,
	},
	likeCount: {
		color: FADED_GREY,
		fontSize: 10,
		lineHeight: 15,
	},
	liked: {
		color: Colors.accent,
	},
});

export default class ChatLikeButton extends Component<void, Props, State> {
	static propTypes = {
		text: PropTypes.object.isRequired,
		textrel: PropTypes.object.isRequired,
		likeText: PropTypes.func.isRequired,
		unlikeText: PropTypes.func.isRequired,
	};

	state: State = {
		likes: 0,
	};

	componentDidMount() {
		this._updateLikeCount(this.props.text);
	}

	componentWillReceiveProps(nextProps: Props) {
		if (this._compareLikeCount(this.props.text, nextProps.text)) {
			this._updateLikeCount(nextProps.text);
		}
	}

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_compareLikeCount = (currentText: Text, nextText: Text) => {
		const currentCount = currentText.counts && currentText.counts.upvote ? currentText.counts.upvote : 0;
		const nextCount = nextText.counts && nextText.counts.upvote ? nextText.counts.upvote : 0;

		return currentCount !== nextCount;
	}

	_updateLikeCount = (text: Text) => {
		const likes = text.counts && text.counts.upvote ? text.counts.upvote : 0;

		if (likes >= 0) {
			this.setState({
				likes,
			});
		}
	};

	_isLiked: Function = () => {
		const {
			textrel,
		} = this.props;

		return textrel && textrel.roles ? textrel.roles.indexOf(ROLE_UPVOTE) > -1 : false;
	};

	_handleLike: Function = () => {
		let { likes } = this.state;

		if (this._isLiked()) {
			likes--;
			this.props.unlikeText();
		} else {
			likes++;
			this.props.likeText();
		}

		if (likes >= 0) {
			this.setState({
				likes,
			});
		}
	};

	render() {
		const liked = this._isLiked();

		return (
			<TouchableOpacity {...this.props} onPress={this._handleLike}>
				<Icon
					style={[ styles.icon, liked ? styles.liked : null ]}
					name={liked ? 'favorite' : 'favorite-border'}
					size={24}
				/>
				<AppText style={[ styles.likeCount, liked ? styles.liked : null ]}>
					{this.state.likes ? this.state.likes : ''}
				</AppText>
			</TouchableOpacity>
		);
	}
}
