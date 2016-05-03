import React, { Component } from 'react';
import * as Constants from '../../lib/Constants';
import config from './config';

const styles = {
	row: {
		display: 'block',
	},
	link: {
		textDecoration: 'none',
		color: '#333333'
	},
	name: {
		fontWeight: 'bold',
	},
	body: {
	},
	creator: {
		fontStyle: 'italic',
	},
	type: {
		fontStyle: 'italic',
	},
	message: {
		font: '16px/24px normal normal Lato,sans-serif',
		margin: '0 auto',
		width: '50%',
		padding: '8px',
	},
};

class TodoItem extends Component {
	render() {
		const todo = this.props.todo,
			thread = (todo.type === Constants.TYPE_THREAD),
			body = todo.tags.indexOf(3) >= 0 ? <img src={todo.meta.photo.thumbnail_url} height="50" /> : todo.body,
			url = 'belong://' + config.server.host + '/' + (
				thread ?
				todo.parents[0] + '/' + todo.id :
				todo.parents[1] + '/' + todo.parents[0]
			),
			type = thread ? 'Start': 'Reply';

		return (
			<div style={styles.message}>
				<a style={styles.link} href={url}>
					<span style={styles.row}>
						<span style={styles.type}>{type} by </span>
						<span style={styles.creator}>{todo.creator}: </span>
						<span style={styles.name}>{todo.name}</span>
					</span>
					<span style={styles.row}>
						<span style={styles.body}>{body}</span>
					</span>
				</a>
			</div>
		);
	}
}

export default TodoItem;
