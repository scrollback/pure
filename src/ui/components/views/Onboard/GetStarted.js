/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import NextButton from './NextButton';
import OnboardTitle from './OnboardTitle';
import OnboardParagraph from './OnboardParagraph';
import CheckedLabel from './CheckedLabel';
import TouchFeedback from '../Core/TouchFeedback';
import Icon from '../Core/Icon';
import AppText from '../Core/AppText';
import Colors from '../../../Colors';

const {
	View,
	StatusBar,
	StyleSheet,
	Image,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white,
	},

	inner: {
		padding: 15,
		alignItems: 'center',
		justifyContent: 'center',
	},

	text: {
		marginVertical: 8,
	},

	image: {
		margin: 16,
	},

	checklist: {
		alignItems: 'flex-start',
	},

	checkboxContainer: {
		paddingVertical: 16,
		paddingHorizontal: 8,
	},

	checkbox: {
		color: Colors.grey,
	},

	checkboxActive: {
		color: Colors.info,
	},

	invite: {
		flexDirection: 'row',
		alignItems: 'center',
	},

	inviteText: {
		color: Colors.darkGrey,
	},
});

type Props = {
	onChangeField: (type: string, value: boolean) => void;
	submitGetStarted: Function;
	fields: {
		invite: { value: boolean };
	};
	user: ?{
		profile: {
			places: Array<string>;
		};
	};
}

export default class GetStarted extends Component<void, Props, void> {
	static propTypes = {
		onChangeField: PropTypes.func.isRequired,
		submitGetStarted: PropTypes.func.isRequired,
		fields: PropTypes.shape({
			invite: PropTypes.shape({
				value: PropTypes.bool,
			}),
		}).isRequired,
		user: PropTypes.shape({
			profile: PropTypes.shape({
				places: PropTypes.arrayOf(PropTypes.string),
			}),
		}),
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handleInvitePress: Function = () => {
		this.props.onChangeField('invite', !this.props.fields.invite.value);
	};

	render() {
		const {
			invite,
		} = this.props.fields;

		return (
			<View style={styles.container}>
				<StatusBar backgroundColor={Colors.grey} />
				<View style={[ styles.container, styles.inner ]}>
					<OnboardTitle style={styles.text}>
						You are all set!
					</OnboardTitle>
					<OnboardParagraph style={styles.text}>
						You're now connected to your
					</OnboardParagraph>
					<View style={styles.checklist}>
						<CheckedLabel label='Apartment' />
						<CheckedLabel label='Locality' />
						<CheckedLabel label='City' />
					</View>
					<Image style={styles.image} source={require('../../../../../assets/place-connected.png')} />
					<View style={styles.invite}>
						<TouchFeedback onPress={this._handleInvitePress} borderless>
							<View style={styles.checkboxContainer}>
								<Icon
									style={invite.value ? styles.checkboxActive : styles.checkbox}
									name={invite.value ? 'check-box' : 'check-box-outline-blank'}
									size={24}
								/>
							</View>
						</TouchFeedback>
						<AppText style={styles.inviteText}>Invite my friends</AppText>
					</View>
				</View>
				<NextButton label="Let's go" onPress={this.props.submitGetStarted} />
			</View>
		);
	}
}
