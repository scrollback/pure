/* @flow */

import React, { Component } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import LoadingItem from '../Core/LoadingItem';
import Page from './Page';

export default class PageLoading extends Component<void, any, void> {
	shouldComponentUpdate(nextProps: any, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		return (
			<Page {...this.props}>
				<LoadingItem />
			</Page>
		);
	}
}
