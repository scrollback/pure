/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from '../Core/AppText';
import Icon from '../Core/Icon';
import Colors from '../../../Colors';

const {
	View,
	TouchableOpacity,
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 8,
		height: 56,
	},

	name: {
		fontSize: 14,
		fontWeight: 'bold',
		color: Colors.darkGrey,
	},

	type: {
		fontSize: 12,
		color: Colors.fadedBlack,
	},

	iconContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		height: 36,
		width: 36,
		borderRadius: 18,
		backgroundColor: Colors.underlay,
		marginHorizontal: 16,
	},

	icon: {
		color: Colors.fadedBlack,
	},

	closeContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		margin: 16,
		padding: 4,
		borderRadius: 12,
		backgroundColor: Colors.underlay,
	},

	nameContainer: {
		flex: 1,
	},
});

const ICONS = {
	home: 'location-city',
	work: 'work',
	hometown: 'home',
};

type Props = {
	place: {
		title: string;
	};
	type: 'home' | 'work' | 'hometown';
	onRemove: Function;
}

export default class PlaceItem extends Component<void, Props, void> {
	static propTypes = {
		place: PropTypes.shape({
			title: PropTypes.string.isRequired,
		}),
		type: PropTypes.string.isRequired,
		onRemove: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handleRemove = () => {
		this.props.onRemove(this.props.type, this.props.place);
	};

	_capitalizeText = (text: string) => {
		return text
			.replace(/-+/g, ' ')
			.replace(/\w\S*/g, s => s.charAt(0).toUpperCase() + s.slice(1))
			.trim();
	};

	render() {
		const {
			place,
			type,
		} = this.props;

		return (
			<View style={styles.container}>
				<View style={styles.iconContainer}>
					<Icon
						style={styles.icon}
						name={ICONS[type]}
						size={16}
					/>
				</View>
				<View style={styles.nameContainer}>
					<AppText style={styles.name} numberOfLines={1}>{place.title}</AppText>
					<AppText style={styles.type} numberOfLines={1}>{this._capitalizeText(type)}</AppText>
				</View>
				<TouchableOpacity onPress={this._handleRemove}>
					<View style={styles.closeContainer}>
						<Icon
							style={styles.icon}
							name='close'
							size={12}
						/>
					</View>
				</TouchableOpacity>
			</View>
		);
	}
}
