/**
 * A searchable ListView with memoization
 * Supports both synchornous and async results
 *
 *  @flow
 */

import React, { Component, PropTypes } from 'react';
import debounce from 'lodash/debounce';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import SearchBar from './Searchbar';
import PageEmpty from '../Page/PageEmpty';
import PageLoading from '../Page/PageLoading';

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

type SearchResults = Array<any> | '@@blankslate' | '@@loading' | '@@failed';

type Props = {
	autoFocus?: boolean;
	getResults: (filter: string) => any;
	renderRow: (data: any) => React.Element;
	renderHeader?: ?(filter: string, data: any) => ?Element;
	renderFooter?: ?(filter: string, data: any) => ?Element;
	renderBlankslate?: ?() => ?React.Element;
	onCancel?: ?(data: any) => React.Element;
	searchHint: string;
	style?: any;
}

type State = {
	filter: string;
	data: SearchResults;
	dataSource: ListView.DataSource;
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
		dataSource: new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2,
		}),
	};

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_subscription: ?Subscription;
	_cachedResults: Object = {};

	_cacheResults = (filter: string, data: SearchResults) => {
		if (Array.isArray(data)) {
			this._cachedResults[filter] = data;
		}
	};

	_setFilterAndResults = (filter: string, data: SearchResults) => {
		this.setState({
			filter,
			data,
			dataSource: this.state.dataSource.cloneWithRows(Array.isArray(data) ? data : []),
		});
	};

	_cacheAndSetResults = (filter: string, data: SearchResults) => {
		this._cacheResults(filter, data);

		if (filter === this.state.filter) {
			this._setFilterAndResults(filter, data);
		}
	};

	_fetchResults = debounce(async (filter: string): Promise<void> => {
		try {
			const data = this.props.getResults(filter);

			if (data && data instanceof Observable) {
				this._subscription = data.subscribe({
					next: (results) => {
						this._cacheAndSetResults(filter, results);
					},

					error: () => {
						this._cacheAndSetResults(filter, '@@failed');
					},
				});
			} else {
				const results = await data;

				this._cacheAndSetResults(filter, results);
			}
		} catch (e) {
			this._cacheAndSetResults(filter, '@@failed');
		}
	});

	_handleChangeSearch = (filter: string) => {
		if (filter) {
			const data = this._cachedResults[filter];

			this._setFilterAndResults(filter, data || '@@loading');

			if (data) {
				return;
			}

			if (this._subscription) {
				this._subscription.unsubscribe();
				this._subscription = null;
			}

			this._fetchResults(filter);
		} else {
			this._setFilterAndResults(filter, '@@blankslate');
		}
	};

	_renderHeader = (): ?Element => {
		if (this.props.renderHeader) {
			return this.props.renderHeader(this.state.filter, this.state.data);
		}

		return null;
	};

	_renderFooter = (): ?Element => {
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
						dataSource={this.state.dataSource}
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
