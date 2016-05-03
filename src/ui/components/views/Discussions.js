/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import DiscussionItemContainer from '../containers/DiscussionItemContainer';
import CTACardContainerRoom from '../containers/CTACardContainerRoom';
import PageEmpty from './PageEmpty';
import PageLoading from './PageLoading';
import LoadingItem from './LoadingItem';
import StartDiscussionButton from './StartDiscussionButton';
import type { Thread } from '../../../lib/schemaTypes';

const {
	PixelRatio,
	Dimensions,
	StyleSheet,
	ListView,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	column: {
		paddingTop: 4,
		paddingBottom: 88,
	},

	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		paddingTop: 8,
		paddingBottom: 88,
	},

	columnItem: {
		overflow: 'hidden',
	},

	gridItem: {
		overflow: 'hidden',
		width: 320,
		marginHorizontal: 8,
		marginVertical: 8,
		borderLeftWidth: 1 / PixelRatio.get(),
		borderRightWidth: 1 / PixelRatio.get(),
		borderRadius: 3,
	},
});

type Props = {
	user: string;
	room: string;
	data: Array<Thread | { type: 'loading' } | { type: 'failed' }>;
	loadMore: (count: number) => void;
	onNavigation: (count: number) => void;
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
		onNavigation: PropTypes.func.isRequired,
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
		return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
	}

	_loadMore: Function = () => {
		this.props.loadMore(this.props.data.length);
	};

	_renderRow: Function = thread => {
		if (!thread) {
			return null;
		}

		switch (thread.type) {
		case 'loading':
			return <LoadingItem />;
		case 'cta':
			return <CTACardContainerRoom room={this.props.room} />;
		default:
			return (
				<DiscussionItemContainer
					key={thread.id}
					thread={thread.id}
					onNavigation={this.props.onNavigation}
					style={Dimensions.get('window').width > 400 ? styles.gridItem : styles.columnItem}
				/>
			);
		}
	};

	render() {
		let placeHolder;

		if (this.props.data.length === 0) {
			placeHolder = <PageEmpty label='No discussions yet' image='sad' />;
		} else if (this.props.data.length === 1) {
			switch (this.props.data[0] && this.props.data[0].type) {
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
						contentContainerStyle={Dimensions.get('window').width > 400 ? styles.grid : styles.column}
						onEndReached={this._loadMore}
						dataSource={this.state.dataSource}
						renderRow={this._renderRow}
					/>
				}

				<StartDiscussionButton
					room={this.props.room}
					user={this.props.user}
					onNavigation={this.props.onNavigation}
				/>
			</View>
		);
	}
}
