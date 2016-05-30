/* @flow */

import React, { Component } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import Radium from 'radium';
import Loading from './Core/Loading';
import Colors from '../../Colors';

const styles = {
	container: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		height: '100%',
		width: '100%',
		textAlign: 'center',
		backgroundColor: Colors.primary,
	},
	logo: {
		margin: 120,
	},
	loading: {
		height: 24,
		width: 24,
		marginVertical: 96,
		marginHorizontal: 16,
	},
};

class Splash extends Component<void, any, void> {
	shouldComponentUpdate(nextProps: any, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		return (
			<div style={styles.container}>
				<img style={styles.logo} src={require('../../../../assets/logo-white.png')} />
				<Loading style={styles.loading} color={Colors.white} />
			</div>
		);
	}
}

export default Radium(Splash);
