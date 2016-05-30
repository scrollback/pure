/* @flow */

import React, { Children, Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import ReactNative from 'react-native';
import Modal from './Modal';
import Colors from '../../../Colors';

const {
	View,
	StyleSheet,
	TouchableWithoutFeedback,
	StatusBar,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-end',
		alignItems: 'stretch',
		backgroundColor: Colors.fadedBlack,
	},
	sheet: {
		backgroundColor: Colors.white,
	},
});

type Props = {
	onRequestClose: Function;
	visible: boolean;
	children?: React.Element;
}

export default class ActionSheet extends Component<void, Props, void> {
	static propTypes = {
		onRequestClose: PropTypes.func.isRequired,
		visible: PropTypes.bool.isRequired,
		children: PropTypes.node.isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		const {
			children,
			visible,
			onRequestClose,
		} = this.props;

		return (
			<Modal
				transparent
				animationType='fade'
				{...this.props}
			>
				<TouchableWithoutFeedback onPress={onRequestClose}>
					<View style={styles.container}>
						{visible ? <StatusBar backgroundColor='#251945' /> : null}
						<View style={styles.sheet}>
							{Children.map(children, child => {
								if (child) {
									return React.cloneElement(child, { onRequestClose });
								} else {
									return null;
								}
							})}
						</View>
					</View>
				</TouchableWithoutFeedback>
			</Modal>
		);
	}
}
