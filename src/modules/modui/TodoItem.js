import React, { Component } from 'react';
import Radium from 'radium';
import * as Constants from '../../lib/Constants';
import config from './config';

const styles = {
	room: {
		height: '14px',
		marginLeft: '5px',
		marginTop: '10px',
		marginBottom: '5px',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		fontSize: '14px',
		fontWeight: 'bold',
		fontFamily: 'Open Sans',
		flexGrow: '1',
		flexWrap: 'nowrap'
	},
	message: {
		height: '14px',
		marginLeft: '5px',
		marginBottom: '5px',
		overflow: 'hidden',
		flexWrap: 'nowrap',
		fontSize: '14px',
		fontWeight: '400',
		fontFamily: 'Open Sans'
	},
	creator: {
		height: '14px',
		marginLeft: '5px',
		marginBottom: '5px',
		flexWrap: 'nowrap',
		fontFamily: 'Open Sans',
		fontSize: '12px',
		fontStyle: 'italic'
	},
	time: {
		height: '14px',
		marginRight: '15px',
		float: 'right'
	},
	line: {
		marginTop: '10px',
		borderBottom: '1px solid #e9ebed',
	},
	button: {
		marginRight: '15px',
		float: 'right',
		fontSize: '8px',
		flexGrow: '0',
	},
	header: {
		direction: 'flex',
		flexDirection: 'column',
	}
};

class TodoItem extends Component {
	render() {
		const todo = this.props.todo,
			thread = (todo.type === Constants.TYPE_THREAD),
			body = todo.tags.indexOf(3) >= 0 ? <img src={todo.meta.photo.thumbnail_url} height='50' /> : todo.body,
			url = 'belong://' + config.server.host + '/' + (
				thread ?
				todo.parents[0] + '/' + todo.id :
				todo.parents[1] + '/' + todo.parents[0]
			);

		return (
			<div>
				<a href={url} >
					<div style={styles.header}>
		                <button
							style={styles.button}
							onClick={() => this.props.removeTodo(this.props.index)}>x
						</button>
		                <div style={styles.room}>{todo.room}</div>
		            </div>
		            <div style={styles.body}>{body}</div>
		            <div style={styles.header}>
		                <div style={styles.time}>{todo.time}</div>
		                <div style={styles.creator}>{todo.creator}</div>
		            </div>
		            <div style={styles.line}></div>
				</a>
	        </div>
		);
	}
}

export default Radium(TodoItem);

/*-
<span style={styles.row}>
    <span style={styles.type}>{type} by </span>
               <span style={styles.creator}>{todo.creator}: </span>
               <span style={styles.name}>{todo.name}</span>
       </span>
       <span style={styles.row}>
               <span style={styles.body}>{body}</span>
       </span>
*/
