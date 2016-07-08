/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import ChatItem from './ChatItem';
import PageEmpty from '../Page/PageEmpty';
import PageLoading from '../Page/PageLoading';
import LoadingItem from '../Core/LoadingItem';
import type { Text, TextRel } from '../../../../lib/schemaTypes';

const {
	StyleSheet,
	ListView,
	RecyclerViewBackedScrollView,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		paddingVertical: 4,
	},
	inverted: {
		transform: [
			{ scaleY: -1 },
		],
	},
	item: {
		overflow: 'hidden',
	},
});

type DataItem = {
	text: Text;
	textrel: ?TextRel;
	previousText: ?Text;
	isLast: ?boolean;
	type?: 'loading';
}

type Props = {
	data: Array<DataItem>;
	user: string;
	loadMore: (count: number) => void;
	quoteMessage: Function;
	replyToMessage: Function;
	onNavigate: Function;
}

type State = {
	dataSource: ListView.DataSource
}

export default class ChatMessages extends Component<void, Props, State> {
	static propTypes = {
		data: PropTypes.arrayOf(PropTypes.object).isRequired,
		user: PropTypes.string.isRequired,
		loadMore: PropTypes.func.isRequired,
		quoteMessage: PropTypes.func.isRequired,
		replyToMessage: PropTypes.func.isRequired,
		onNavigate: PropTypes.func.isRequired,
	};

	state: State = {
		dataSource: new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2,
		}),
	};

	componentWillMount() {
		this.setState({
			dataSource: this.state.dataSource.cloneWithRows(this.props.data),
		});
	}

	componentWillReceiveProps(nextProps: Props) {
		this.setState({
			dataSource: this.state.dataSource.cloneWithRows(nextProps.data),
		});
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_loadMore = () => {
		this.props.loadMore(this.props.data.length);
	};

	_renderRow = (item: DataItem) => {
		if (item && item.type === 'loading') {
			return <LoadingItem />;
		}

		const { text, textrel, previousText } = item;

		return (
			<ChatItem
				key={text.id}
				text={text}
				textrel={textrel}
				isLast={item.isLast}
				previousText={previousText}
				replyToMessage={this.props.replyToMessage}
				quoteMessage={this.props.quoteMessage}
				user={this.props.user}
				style={[ styles.item, styles.inverted ]}
				onNavigate={this.props.onNavigate}
			/>
		);
	};

	_renderScrollComponent = (props: any) => {
		return <RecyclerViewBackedScrollView {...props} />;
	};

	render() {
		const { data } = this.props;

		let placeHolder;

		if (data.length === 0) {
			placeHolder = <PageEmpty label='No messages yet' image={require('../../../../../assets/empty-box.png')} />;
		} else if (data.length === 1) {
			switch (data[0] && data[0].type) {
			case 'loading':
				placeHolder = <PageLoading />;
				break;
			}
		}

		return (
			<View {...this.props}>
				{placeHolder ? placeHolder :
					<ListView
						removeClippedSubviews
						keyboardShouldPersistTaps={false}
						initialListSize={10}
						pageSize={10}
						renderRow={this._renderRow}
						renderScrollComponent={this._renderScrollComponent}
						onEndReached={this._loadMore}
						dataSource={this.state.dataSource}
						style={styles.inverted}
						contentContainerStyle={styles.container}
					/>
				}
			</View>
		);
	}
}
