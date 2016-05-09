/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import Colors from '../../Colors';
import AppText from './AppText';
import Icon from './Icon';
import TouchFeedback from './TouchFeedback';

const {
	StyleSheet,
	Animated,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	banner: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: Colors.fadedBlack,
	},
	info: {
		backgroundColor: Colors.info,
	},
	error: {
		backgroundColor: Colors.error,
	},
	success: {
		backgroundColor: Colors.success,
	},
	textContainer: {
		flex: 1,
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	text: {
		color: Colors.white,
	},
	icon: {
		margin: 16,
		color: Colors.white,
	},
});

type Props = {
	text?: ?string;
	type?: 'info' | 'success' | 'error';
	style?: any;
	showClose?: boolean;
}

type DefaultProps = {
	showClose: boolean;
}

type State = {
	heightAnim: Animated.Value;
	text?: ?string;
}

export default class Banner extends Component<DefaultProps, Props, State> {
	static propTypes = {
		text: PropTypes.string,
		type: PropTypes.oneOf([ 'info', 'success', 'error' ]),
		style: View.propTypes.style,
		showClose: PropTypes.bool,
	};

	static defaultProps = {
		showClose: true,
	};

	state: State = {
		heightAnim: new Animated.Value(0),
		text: this.props.text,
	};

	componentDidMount() {
		if (this.state.text) {
			this._animateIn();
		}
	}

	componentWillReceiveProps(nextProps: Props) {
		if (nextProps.text) {
			if (!this.state.text) {
				this.setState({
					text: nextProps.text,
				}, () => this._animateIn());

				return;
			}
		} else {
			if (this.state.text) {
				this._handleCloseBanner();

				return;
			}
		}

		this.setState({
			text: nextProps.text,
		});
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
	}

	_animateIn: Function = cb => {
		Animated.timing(this.state.heightAnim, {
			toValue: 45,
			duration: 200,
		}).start(cb);
	};

	_animateOut: Function = cb => {
		Animated.timing(this.state.heightAnim, {
			toValue: 0,
			duration: 200,
		}).start(cb);
	};

	_handleCloseBanner: Function = () => {
		this._animateOut(() => {
			this.setState({
				text: null,
			});
		});
	};

	render(): ?React.Element {
		if (!this.state.text) {
			return null;
		}

		return (
			<Animated.View {...this.props} style={[ styles.banner, styles[this.props.type], { height: this.state.heightAnim }, this.props.style ]}>
				<View style={styles.textContainer}>
					<AppText style={styles.text} numberOfLines={1}>{this.state.text}</AppText>
				</View>
				{this.props.showClose ?
					<TouchFeedback onPress={this._handleCloseBanner}>
						<View>
							<Icon
								name='close'
								style={styles.icon}
								size={16}
							/>
						</View>
					</TouchFeedback> :
					null
				}
			</Animated.View>
		);
	}
}
