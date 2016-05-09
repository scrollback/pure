/**
 * A searchable ListView with memoization
 * Supports both synchornous and async results
 *
 *  @flow
 */

import React, { Component, PropTypes } from 'react';
import debounce from 'lodash/debounce';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import SearchBar from './Searchbar';
import PageEmpty from './PageEmpty';
import PageLoading from './PageLoading';

const {
	StyleSheet,
	View,
	ListView,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

type Props = {
	autoFocus?: boolean;
	getResults: (filter: string) => any | Promise<any>;
	renderRow: (data: any) => Element;
	renderHeader?: ?(filter: string, data: any) => ?Element;
	renderFooter?: ?(filter: string, data: any) => ?Element;
	renderBlankslate?: ?() => ?Element;
	onCancel?: ?(data: any) => Element;
	searchHint: string;
	style?: any;
}

type State = {
	filter: string;
	data: Array<any> | '@@blankslate' | '@@loading' | '@@failed';
}

export default class SearchableList extends Component<void, Props, State> {
	static propTypes = {
		autoFocus: PropTypes.bool,
		getResults: PropTypes.func.isRequired,
		renderRow: PropTypes.func.isRequired,
		renderHeader: PropTypes.func,
		renderFooter: PropTypes.func,
		renderBlankslate: PropTypes.func,
		onCancel: PropTypes.func,
		searchHint: PropTypes.string.isRequired,
		style: View.propTypes.style,
	};

	state: State = {
		filter: '',
		data: '@@blankslate',
	};

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
	}

	_cachedResults: Object = {};

	_dataSource: ListView.DataSource = new ListView.DataSource({
		rowHasChanged: (r1, r2) => r1 !== r2,
	});

	_fetchResults: Function = debounce(async (filter: string): Promise => {
		try {
			const data = this._cachedResults[filter] = await this.props.getResults(filter);

			if (filter === this.state.filter) {
				this.setState({
					data,
				});
			}
		} catch (e) {
			if (filter === this.state.filter) {
				this.setState({
					data: '@@failed',
				});
			}
		}
	});

	_handleChangeSearch: Function = (filter: string) => {
		if (filter) {
			const data = this._cachedResults[filter];

			this.setState({
				filter,
				data: data || '@@loading',
			});

			if (data) {
				return;
			}

			this._fetchResults(filter);
		} else {
			this.setState({
				filter,
				data: '@@blankslate',
			});
		}
	};

	_getDataSource: Function = (): ListView.DataSource => {
		return this._dataSource.cloneWithRows(this.state.data);
	};

	_renderHeader: Function = (): ?Element => {
		if (this.props.renderHeader) {
			return this.props.renderHeader(this.state.filter, this.state.data);
		}

		return null;
	};

	_renderFooter: Function = (): ?Element => {
		if (this.props.renderFooter) {
			return this.props.renderFooter(this.state.filter, this.state.data);
		}

		return null;
	};

	render() {
		let placeHolder;

		switch (this.state.data) {
		case '@@blankslate':
			if (this.props.renderBlankslate) {
				placeHolder = this.props.renderBlankslate();
			} else {
				placeHolder = <PageEmpty label='Come on, type something!' image='happy' />;
			}
			break;
		case '@@loading':
			placeHolder = <PageLoading />;
			break;
		case '@@failed':
			placeHolder = <PageEmpty label='Failed to load results' image='sad' />;
			break;
		default:
			if (this.state.data && this.state.data.length) {
				placeHolder = (
					<ListView
						keyboardShouldPersistTaps
						dataSource={this._getDataSource()}
						renderRow={this.props.renderRow}
						renderHeader={this._renderHeader}
						renderFooter={this._renderFooter}
					/>
				);
			} else {
				placeHolder = <PageEmpty label='No results found' image='sad' />;
			}
		}

		return (
			<View {...this.props} style={[ styles.container, this.props.style ]}>
				<SearchBar
					placeholder={this.props.searchHint}
					onCancel={this.props.onCancel}
					onChangeSearch={this._handleChangeSearch}
					autoFocus={this.props.autoFocus}
				/>
				{placeHolder}
			</View>
		);
	}
}
