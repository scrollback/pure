/* @flow */

import React, { Component } from 'react';
import Connect from '../../../modules/store/Connect';
import RoomsFooter from '../views/Homescreen/RoomsFooter';

const mapSubscriptionToProps = {
	places: {
		key: 'me',
		transform: user => user.params && user.params.places ? user.params.places : {},
	},
};

class RoomsFooterContainer extends Component {
	render() {
		return (
			<Connect
				mapSubscriptionToProps={mapSubscriptionToProps}
				passProps={this.props}
				component={RoomsFooter}
			/>
		);
	}
}

export default RoomsFooterContainer;
