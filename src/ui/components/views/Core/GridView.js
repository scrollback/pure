/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';

const {
	Dimensions,
	ListView,
	RecyclerViewBackedScrollView,
	ScrollView,
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'flex-start',
		justifyContent: 'center',
	},
});

type Props = {
	minimumWidth: number;
	gridSpacing: number;
	gridItemStyle?: any;
	itemStyle?: any;
	renderRow: (rowData: any, sectionID: number, rowID: number, highlightRow: boolean, isGrid: boolean) => ?React.Element<*>;
	renderScrollComponent?: (props: any) => ?React.Element<*>;
	contentContainerStyle?: any;
	style?: any;
}

type DefaultProps = {
	minimumWidth: number;
	gridSpacing: number;
}

type State = {
	grid: boolean;
	measured: boolean;
}

export default class GridView extends Component<DefaultProps, Props, State> {
	static propTypes = {
		minimumWidth: PropTypes.number.isRequired,
		gridSpacing: PropTypes.number.isRequired,
		gridItemStyle: View.propTypes.style,
		itemStyle: View.propTypes.style,
		renderRow: PropTypes.func.isRequired,
		renderScrollComponent: PropTypes.func,
		contentContainerStyle: ListView.propTypes.style,
		style: View.propTypes.style,
	};

	static defaultProps = {
		minimumWidth: 480,
		gridSpacing: 24,
	};

	constructor(props: Props) {
		super(props);

		this.state = {
			grid: Dimensions.get('window').width >= this.props.minimumWidth,
			measured: false,
		};
	}

	state: State;

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_renderRow = (rowData: any, sectionID: number, rowID: number, highlightRow: boolean) => {
		return (
			<View
				style={[
					this.state.grid ? {
						marginHorizontal: this.props.gridSpacing / 2,
						marginVertical: this.props.gridSpacing / 4,
						width: this.props.minimumWidth - (this.props.gridSpacing * 3),
					} : null,
					this.props.itemStyle,
					this.state.grid ? this.props.gridItemStyle : null,
				]}
			>
				{this.props.renderRow(rowData, sectionID, rowID, highlightRow, this.state.grid)}
			</View>
		);
	};

	_renderScrollComponent = (props: any) => {
		if (this.props.renderScrollComponent) {
			return this.props.renderScrollComponent(props);
		} else {
			// FIXME: RecyclerViewBackedScrollView doesn't support multi-column mode
			return this.state.grid ? <ScrollView {...props} /> : <RecyclerViewBackedScrollView {...props} />;
		}
	};

	_handleLayout = (e: any) => {
		if (this.props.onLayout) {
			this.props.onLayout(e);
		}

		this.setState({
			grid: e.nativeEvent.layout.width >= this.props.minimumWidth,
			measured: true,
		});
	};

	render() {
		return (
			<ListView
				{...this.props}
				onLayout={this._handleLayout}
				renderScrollComponent={this._renderScrollComponent}
				renderRow={this._renderRow}
				contentContainerStyle={[
					this.state.grid ? { margin: this.props.gridSpacing / 2 } : null,
					this.state.grid ? styles.grid : null, this.props.contentContainerStyle,
				]}
			/>
		);
	}
}
