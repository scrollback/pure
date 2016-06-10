/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import CTACardContainerRoom from '../../containers/CTACardContainerRoom';
import PageEmpty from '../Page/PageEmpty';
import PageLoading from '../Page/PageLoading';
import LoadingItem from '../Core/LoadingItem';
import DiscussionItem from './DiscussionItem';
import StartDiscussionButton from '../StartDiscussion/StartDiscussionButton';
import type { Thread, ThreadRel } from '../../../../lib/schemaTypes';

const {
	PixelRatio,
	Dimensions,
	StyleSheet,
	RecyclerViewBackedScrollView,
	ListView,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	column: {
		paddingTop: 6,
		paddingBottom: 88,
	},

	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		paddingTop: 12,
		paddingBottom: 88,
	},

	columnItem: {
		overflow: 'hidden',
	},

	gridItem: {
		overflow: 'hidden',
		width: 320,
		marginHorizontal: 12,
		marginVertical: 12,
		borderLeftWidth: 1 / PixelRatio.get(),
		borderRightWidth: 1 / PixelRatio.get(),
		borderRadius: 3,
	},
});

type DataItem = {
	thread: Thread;
	threadrel: ?ThreadRel;
	type?: 'loading'
};

type Props = {
	user: string;
	room: string;
	data: Array<DataItem>;
	loadMore: (count: number) => void;
	onNavigate: (count: number) => void;
}

type State = {
	dataSource: ListView.DataSource
}

export default class Discussions extends Component<void, Props, State> {
	static propTypes = {
		data: PropTypes.arrayOf(PropTypes.object).isRequired,
		room: PropTypes.string.isRequired,
		user: PropTypes.string.isRequired,
		loadMore: PropTypes.func.isRequired,
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

	_isWide = () => {
		return Dimensions.get('window').width > 400;
	};

	_renderRow = ({ thread, threadrel, type }: DataItem) => {
		switch (type) {
		case 'loading':
			return <LoadingItem />;
		case 'cta':
			return <CTACardContainerRoom room={this.props.room} style={this._isWide() ? styles.gridItem : styles.columnItem} />;
		default:
			if (!thread) {
				return null;
			}

			if (thread.type === 'loading') {
				return <LoadingItem />;
			}

			return (
				<DiscussionItem
					key={thread.id}
					thread={thread}
					threadrel={threadrel}
					onNavigate={this.props.onNavigate}
					style={this._isWide() ? styles.gridItem : styles.columnItem}
				/>
			);
		}
	};

	_renderScrollComponent = (props: any) => {
		return <RecyclerViewBackedScrollView {...props} />;
	};

	render() {
		const {
			data,
		} = this.props;

		let placeHolder;

		if (data.length === 0) {
			placeHolder = <PageEmpty label='No discussions yet' image='sad' />;
		} else if (data.length === 1) {
			switch (data[0] && data[0].type) {
			case 'loading':
				placeHolder = <PageLoading />;
				break;
			case 'banned':
				placeHolder = <PageEmpty label="You're banned in this group" image='meh' />;
				break;
			case 'nonexistent':
				placeHolder = <PageEmpty label="This group doesn't exist" image='sad' />;
				break;
			case 'failed':
				placeHolder = <PageEmpty label='Failed to load discussions' image='sad' />;
				break;
			}
		}

		return (
			<View {...this.props}>
				{placeHolder ? placeHolder :
					<ListView
						removeClippedSubviews
						initialListSize={3}
						pageSize={3}
						renderScrollComponent={this._renderScrollComponent}
						renderRow={this._renderRow}
						onEndReached={this.props.loadMore}
						dataSource={this.state.dataSource}
						contentContainerStyle={this._isWide() ? styles.grid : styles.column}
					/>
				}

				<StartDiscussionButton
					room={this.props.room}
					onNavigate={this.props.onNavigate}
				/>
			</View>
		);
	}
}
