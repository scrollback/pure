/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import CTACardContainerRoom from '../../containers/CTACardContainerRoom';
import GridView from '../Core/GridView';
import PageEmpty from '../Page/PageEmpty';
import PageLoading from '../Page/PageLoading';
import LoadingItem from '../Core/LoadingItem';
import DiscussionItem from './DiscussionItem';
import StartDiscussionButton from '../StartDiscussion/StartDiscussionButton';
import type { Thread, ThreadRel } from '../../../../lib/schemaTypes';

const {
	Dimensions,
	StyleSheet,
	ListView,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		paddingTop: 8,
		paddingBottom: 88, // FIXME: this doesn't work in `RecyclerViewBackedScrollView`
	},

	item: {
		overflow: 'hidden',
	},

	card: {
		borderRadius: 3,
		borderWidth: StyleSheet.hairlineWidth,
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
	dataSource: ListView.DataSource;
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

	_renderRow = ({ thread, threadrel, type }: DataItem, sectionID: number, rowID: number, highlightRow: boolean, isGrid: boolean) => {
		switch (type) {
		case 'loading':
			return <LoadingItem />;
		case 'cta':
			return <CTACardContainerRoom room={this.props.room} style={[ styles.item, isGrid ? styles.card : null ]} />;
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
					style={[ styles.item, isGrid ? styles.card : null ]}
				/>
			);
		}
	};

	render() {
		const {
			data,
		} = this.props;

		let placeHolder;

		if (data.length === 0) {
			placeHolder = <PageEmpty label='No discussions yet' image={require('../../../../../assets/empty-box.png')} />;
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
					<GridView
						removeClippedSubviews
						initialListSize={2}
						pageSize={4}
						renderRow={this._renderRow}
						onEndReached={this.props.loadMore}
						dataSource={this.state.dataSource}
						contentContainerStyle={styles.container}
						itemStyle={styles.item}
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
