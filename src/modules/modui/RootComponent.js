import React, { Component } from 'react';
import Radium from 'radium';
import TodoList from './TodoList';
import ReplyBox from './ReplyBox';

// let todo = [];

const styles = {
	container: {
		height: '100%'
	},
	background: {
		color: '#8080ff'
	},
};

class RootComponent extends Component {

	constructor(props) {
		super(props);
		this.state = { id: null };
		this.state.todo = this.props.todo;
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
			<div style={styles.background}>
				<div style={styles.container}>
					<TodoList
						todo={this.state.todo}
						removeTodo={this.removeTodo}
						selectId={this.selectTodo}
					/>
					<ReplyBox />
				</div>
			</div>
		);
	}
}

export default Radium(RootComponent);
