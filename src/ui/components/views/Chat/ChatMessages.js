/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import ChatItem from './ChatItem';
import ChatDiscussionItemContainer from '../../containers/ChatDiscussionItemContainer';
import PageLoading from '../Page/PageLoading';
import PageEmpty from '../Page/PageEmpty';
import LoadingItem from '../Core/LoadingItem';
import type {
	Text,
	TextRel,
	Thread,
	ThreadRel,
	Room,
} from '../../../../lib/schemaTypes';

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
	thread: Thread;
	threadrel: ?ThreadRel;
	room: Room;
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
		thread: PropTypes.object.isRequired,
		threadrel: PropTypes.object,
		room: PropTypes.object.isRequired,
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

	_renderHeader = () => {
		if (this.props.thread && this.props.thread.type !== 'loading') {
			return (
				<ChatDiscussionItemContainer
					showTimestamp
					room={this.props.room}
					thread={this.props.thread}
					threadrel={this.props.threadrel}
					user={this.props.user}
					onNavigate={this.props.onNavigate}
					style={[ styles.item, styles.inverted ]}
				/>
			);
		}

		return null;
	};

	_renderRow = (item: DataItem) => {
		if (item && item.type === 'loading') {
			return <LoadingItem />;
		}

		const { text, textrel, previousText } = item;

		let showTimestamp = item.isLast === true;

		if (previousText && !showTimestamp) {
			showTimestamp = (text.createTime - previousText.createTime) > 300000;
		}

		return (
			<ChatItem
				key={text.id}
				text={text}
				textrel={textrel}
				showTimestamp={showTimestamp}
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
		const { data, thread } = this.props;

		let placeHolder;

		if (!thread) {
			placeHolder = <PageEmpty label='Discussion not found' image={require('../../../../../assets/empty-box.png')} />;
		}

		if (data.length === 1) {
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
						initialListSize={5}
						pageSize={5}
						renderFooter={this._renderHeader}
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
