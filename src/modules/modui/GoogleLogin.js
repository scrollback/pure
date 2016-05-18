import React, { Component } from 'react';
import Radium from 'radium';
import config from './config';

const styles = {
	google: {

	}
};

class GoogleLogin extends Component {

	webLogin: Function = () => {
		window.open('http://' + config.server.host + ':' + config.server.port + config.google.login_url);
	};

	render() {
		return (
			<button style={styles.google} onClick={this.webLogin}>Google</button>
        );
	}
}

export default Radium(GoogleLogin);
