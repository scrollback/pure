/* @flow */

import React, { Children, Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import Modal from './Modal';
import Colors from '../../Colors';

const {
	View,
	StyleSheet,
	TouchableWithoutFeedback,
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
	children?: any;
}

export default class ActionSheet extends Component<void, Props, void> {
	static propTypes = {
		onRequestClose: PropTypes.func.isRequired,
		children: PropTypes.node.isRequired,
	};

	render() {
		const {
			children,
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
