/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import CTACardContainerHome from '../../containers/CTACardContainerHome';
import ListItem from '../Core/ListItem';
import AppText from '../Core/AppText';
import Icon from '../Core/Icon';
import Colors from '../../../Colors';

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	footer: {
		marginVertical: 4,
	},

	footerInner: {
		marginVertical: 4,
	},

	footerItem: {
		height: 48,
	},

	footerLabel: {
		fontSize: 12,
		lineHeight: 18,
		fontWeight: 'bold',
		color: Colors.fadedBlack,
	},

	footerIcon: {
		color: Colors.fadedBlack,
		marginHorizontal: 16,
	},

	highlightLabel: {
		color: Colors.info,
	},
});

type Props = {
	places: {
		[key: string]: any
	};
	onNavigate: Function;
}

type State = {
	button: {
		icon: string;
		label: string;
	}
}

const PLACE_TYPES = [ 'home', 'work', 'hometown' ];

const PLACE_LABELS = {
	default: 'Manage my places',
	home: 'Add where you live',
	work: 'Add where you work or study',
	hometown: 'Add your hometown',
};

const DEFAULT_BUTTON = {
	icon: 'my-location',
	label: PLACE_LABELS.default.toUpperCase(),
	highlight: false,
};

export default class RoomsFooter extends Component<void, Props, State> {
	static propTypes = {
		places: PropTypes.object.isRequired,
		onNavigate: PropTypes.func.isRequired,
	};

	state: State = {
		button: DEFAULT_BUTTON,
	};

	componentWillReceiveProps(nextProps: Props) {
		this.setState({
			button: this._getPlaceLabel(nextProps),
		});
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_getPlaceLabel: Function = ({ places }: Props) => {
		for (let i = 0, l = PLACE_TYPES.length; i < l; i++) {
			const place = PLACE_TYPES[i];

			if (places[place]) {
				continue;
			}

			return {
				icon: 'add-circle',
				label: PLACE_LABELS[place].toUpperCase(),
				highlight: true,
			};
		}

		return DEFAULT_BUTTON;
	};

	_handleManagePlaces: Function = () => {
		this.props.onNavigate({
			type: 'push',
			payload: {
				name: 'places',
			},
		});
	};

	_handleGoToAccount: Function = () => {
		this.props.onNavigate({
			type: 'push',
			payload: {
				name: 'account',
			},
		});
	};

	_handleReportIssue: Function = () => {
		this.props.onNavigate({
			type: 'push',
			payload: {
				name: 'room',
				props: {
					room: 'e8d0a3b8-6c00-4871-84ad-1078b1265c08',
				},
			},
		});
	};

	render() {
		const {
			button,
		} = this.state;

		return (
			<View style={styles.footer}>
				<View style={styles.footerInner}>
					<ListItem containerStyle={styles.footerItem} onPress={this._handleManagePlaces}>
						<Icon
							style={[ styles.footerIcon, button.highlight ? styles.highlightLabel : null ]}
							name={button.icon}
							size={18}
						/>
						<AppText style={[ styles.footerLabel, button.highlight ? styles.highlightLabel : null ]}>
							{button.label}
						</AppText>
					</ListItem>
					<ListItem containerStyle={styles.footerItem} onPress={this._handleGoToAccount}>
						<Icon
							style={styles.footerIcon}
							name='settings'
							size={18}
						/>
						<AppText style={styles.footerLabel}>ACCOUNT SETTINGS</AppText>
					</ListItem>
					<ListItem containerStyle={styles.footerItem} onPress={this._handleReportIssue}>
						<Icon
							style={styles.footerIcon}
							name='info'
							size={18}
						/>
						<AppText style={styles.footerLabel}>REPORT AN ISSUE</AppText>
					</ListItem>
				</View>
				<CTACardContainerHome style={styles.footerInner} />
			</View>
		);
	}
}
