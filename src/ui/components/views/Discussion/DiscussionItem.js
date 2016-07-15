/* @flow */

import React, { Component } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import Card from '../Card/Card';
import DiscussionItemBase from './DiscussionItemBase';

export default class DiscussionItem extends Component<void, any, any> {
	static propTypes = {
		style: Card.propTypes.style,
	};

	shouldComponentUpdate(nextProps: any, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		const { style, ...rest } = this.props;

		return (
			<Card style={style}>
				<DiscussionItemBase {...rest} />
			</Card>
		);
	}
}
