import React, { Component } from 'react';
import Radium from 'radium';
import config from './config';

const styles = {
	facebook: {

	}
};

class FacebookLogin extends Component {

	webLogin: Function = () => {
		window.open('http://' + config.server.host + ':' + config.server.port + config.facebook.login_url);
	};

	render() {
		return (
			<button style={styles.facebook} onClick={this.webLogin}>Facebook</button>
        );
	}
}

export default Radium(FacebookLogin);
