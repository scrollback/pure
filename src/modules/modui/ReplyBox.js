import React, { Component } from 'react';
import Radium from 'radium';

const styles = {
	ban: {

	},
	hide: {

	},
};

class ReplyBox extends Component {
	render() {
		return (
            <div>
                <button style={styles.ban}> Ban </button>
				<button style={styles.hide}> Hide </button>
            </div>
        );
	}
}

export default Radium(ReplyBox);
