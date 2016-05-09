import React, { Component } from 'react';
import Radium from 'radium';
import TodoList from './TodoList';
import ReplyBox from './ReplyBox';

let todo = [];

const styles = {
	container: {
		height: '100%'
	}
};

class RootComponent extends Component {

	constructor(props) {
		super(props);
		this.state = { id: null };
		this.state.todo = todo;
	}

	removeTodo: Function = (index) => {
		this.state.todo.splice(index, 1);
		this.setState({
			todo: this.state.todo
		});
	};

	selectTodo: Function = () => {

	};

	render() {
		return (
			<div style={styles.container}>
				<TodoList
					todo={this.state.todo}
					removeTodo={this.removeTodo}
					selectId={this.selectTodo}
				/>
				<ReplyBox />
			</div>
		);
	}
}

export default Radium(RootComponent);
