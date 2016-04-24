/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import RoomItemContainer from '../containers/RoomItemContainer';
import BannerUnavailable from './BannerUnavailable';
import PageEmpty from './PageEmpty';
import PageLoading from './PageLoading';
import LoadingItem from './LoadingItem';
import ListItem from './ListItem';
import AppText from './AppText';
import Icon from './Icon';
import Colors from '../../Colors';
import NavigationActions from '../../navigation-rfc/Navigation/NavigationActions';
import type { RoomRel, Room } from '../../../lib/schemaTypes';

const {
	StyleSheet,
	View,
	ListView,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},

	footer: {
		marginTop: 8,
	},

	footerItem: {
		height: 48,
	},

	footerLabel: {
		fontSize: 12,
		lineHeight: 18,
		fontWeight: 'bold',
		color: Colors.fadedBlack,
	},

	footerIcon: {
		color: Colors.fadedBlack,
		marginHorizontal: 16,
	},
});

type Props = {
	available?: boolean;
	onNavigation: Function;
	data: Array<{ rel: RoomRel, room: Room } | { type: 'loading' } | { type: 'failed' }>;
}

type State = {
	dataSource: ListView.DataSource
}

export default class Rooms extends Component<void, Props, State> {
	static propTypes = {
		available: PropTypes.bool,
		onNavigation: PropTypes.func.isRequired,
		data: PropTypes.arrayOf(PropTypes.object).isRequired,
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

	_handleSelectLocality: Function = room => {
		this.props.onNavigation(new NavigationActions.Push({
			name: 'room',
			props: {
				room: room.id,
			},
		}));
	};

	_renderRow: Function = result => {
		if (result && result.type === 'loading') {
			return <LoadingItem />;
		}

		return (
			<RoomItemContainer
				key={result.room.id}
				room={result.room.id}
				onSelect={this._handleSelectLocality}
				showMenuButton
				showBadge
			/>
		);
	};

	_handleManagePlaces: Function = () => {
		this.props.onNavigation(new NavigationActions.Push({
			name: 'places',
		}));
	};

	_handleReportIssue: Function = () => {
		this.props.onNavigation(new NavigationActions.Push({
			name: 'room',
			props: {
				room: 'e8d0a3b8-6c00-4871-84ad-1078b1265c08',
			},
		}));
	};

	_renderFooter: Function = () => {
		return (
			<View style={styles.footer}>
				<ListItem containerStyle={styles.footerItem} onPress={this._handleManagePlaces}>
					<Icon
						style={styles.footerIcon}
						name='settings'
						size={18}
					/>
					<AppText style={styles.footerLabel}>MANAGE MY PLACES</AppText>
				</ListItem>
				<ListItem containerStyle={styles.footerItem} onPress={this._handleReportIssue}>
					<Icon
						style={styles.footerIcon}
						name='info'
						size={18}
					/>
					<AppText style={styles.footerLabel}>REPORT AN ISSUE</AppText>
				</ListItem>
			</View>
		);
	};

	render() {
		let placeHolder;

		if (this.props.data.length === 1) {
			switch (this.props.data[0] && this.props.data[0].type || null) {
			case 'loading':
				placeHolder = <PageLoading />;
				break;
			case 'failed':
				placeHolder = <PageEmpty label='Failed to load rooms' image='sad' />;
				break;
			}
		}

		return (
			<View style={styles.container}>
				{this.props.available === false ?
					<BannerUnavailable /> :
					null
				}

				{placeHolder ? placeHolder :
					<ListView
						keyboardShouldPersistTaps
						dataSource={this.state.dataSource}
						renderRow={this._renderRow}
						renderFooter={this._renderFooter}
					/>
				}
			</View>
		);
	}
}
