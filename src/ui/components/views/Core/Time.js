/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from './AppText';
import { formatShort, formatLong } from '../../../../lib/Time';

const msPerSec = 1000;
const msPerMin = msPerSec * 60;
const msPerHour = msPerMin * 60;

type Props = {
	type: 'short' | 'long';
	time: number;
}

type State = {
	now: number
}

export default class Time extends Component<void, Props, State> {
	static propTypes = {
		type: PropTypes.oneOf([ 'short', 'long' ]).isRequired,
		time: PropTypes.number.isRequired,
	};

	state: State;

	componentWillMount() {
		const now = Date.now();

		this.setState({
			now,
		});

		this._setTimer(now);
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	componentWillUnmount() {
		if (this._timer) {
			clearTimeout(this._timer);
		}
	}

	_root: Object;
	_timer: any;

	setNativeProps: Function = (nativeProps) => {
		this._root.setNativeProps(nativeProps);
	};

	_setTimer: Function = time => {
		const diff = time - this.props.time;

		let interval;

		if (diff < msPerMin) {
			interval = msPerSec * 10;
		} else if (diff < msPerHour) {
			interval = msPerMin;
		}

		if (interval) {
			this._timer = setTimeout(() => {
				const now = Date.now();

				this.setState({
					now,
				});

				this._setTimer(now);
			}, interval);
		}
	};

	render() {
		const {
			type,
			time,
		} = this.props;

		return (
			<AppText ref={c => (this._root = c)} {...this.props}>
				{type === 'short' ? formatShort(time, this.state.now) : formatLong(time, this.state.now)}
			</AppText>
		);
	}
}
