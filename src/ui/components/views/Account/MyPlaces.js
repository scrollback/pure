/* @flow */

import React, { PropTypes, Component } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import PlaceManager from './PlaceManager';
import PageLoading from '../Page/PageLoading';
import Colors from '../../../Colors';
import LocationListener from '../../../modules/LocationListener';

const {
	InteractionManager,
} = ReactNative;

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white,
		paddingVertical: 8,
	},
});

type Props = {
	places: Object;
	onNavigate: Function;
	removePlace: Function;
	user: string;
	style?: any;
}

export default class MyPlaces extends Component<void, Props, void> {
	static propTypes = {
		places: PropTypes.object,
		onNavigate: PropTypes.func.isRequired,
		removePlace: PropTypes.func.isRequired,
		user: PropTypes.string.isRequired,
		style: View.propTypes.style,
	};

	componentDidMount() {
		InteractionManager.runAfterInteractions(() => LocationListener.requestEnableLocation(null));
	}

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		if (this.props.places) {
			return (
				<View {...this.props}>
					<PlaceManager
						user={this.props.user}
						places={this.props.places}
						onNavigate={this.props.onNavigate}
						removePlace={this.props.removePlace}
						style={styles.container}
					/>
				</View>
			);
		}

		return <PageLoading />;
	}
}
