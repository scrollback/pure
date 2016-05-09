import React, { Component } from 'react';
import TodoItem from './TodoItem';

let separatorStyle = {
	borderBottom: '1px solid red',
};

class TodoList extends Component {
	render() {
		return (
			<div>
				{this.props.todos.map(todo =>
					todo === 'separator' ?
					<div style={separatorStyle}></div> :
					<TodoItem key={todo.id} todo={todo}/>
				)}
			</div>
		);
	}
}
export default TodoList;
