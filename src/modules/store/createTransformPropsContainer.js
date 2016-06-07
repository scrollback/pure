/* @flow */

import React, { Component } from 'react';

type TransformFunction = (props: any) => any;

export default function(transformFunction: TransformFunction) {
	return function(ChildComponent: ReactClass<any>): ReactClass<any> {
		class TransformPropsContainer extends Component<void, any, void> {
			render() {
				const nextProps = transformFunction(this.props);

				return <ChildComponent {...nextProps} />;
			}
		}

		TransformPropsContainer.displayName = `TransformPropsContainer$${ChildComponent.displayName || ChildComponent.name}`;

		return TransformPropsContainer;
	};
}
