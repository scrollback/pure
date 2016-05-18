import React, { Component } from 'react';
import Radium from 'radium';
import TodoItem from './TodoItem';

const styles = {
	todolist: {
		float: 'left',
		width: '31%',
		height: '100%',
		borderRight: '2px solid #e9ebed',
		overflowY: 'auto'
	},
};

class TodoList extends Component {
	render() {
		return (
			<div style={styles.todolist}>
				{this.props.todo.map((todo, index) =>
					<TodoItem
						key={todo.id}
						todo={todo}
						removeTodo={this.props.removeTodo}
						index={index}
					/>
				)}
			</div>
		);
	}
}
export default Radium(TodoList);
