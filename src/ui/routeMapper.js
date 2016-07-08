/* @flow */

import type { Route } from '../lib/RouteTypes';
import Homescreen from './components/views/Homescreen/Homescreen';
import NotificationIcon from './components/views/Notification/NotificationIcon';
import ProfileButtonContainer from './components/containers/ProfileButtonContainer';
import ShareButtonContainer from './components/containers/ShareButtonContainer';
import DiscussionsDetailsContainer from './components/containers/DiscussionDetailsContainer';
import ChatContainer from './components/containers/ChatContainer';
import ChatTitleContainer from './components/containers/ChatTitleContainer';
import RoomTitleContainer from './components/containers/RoomTitleContainer';
import DiscussionsContainer from './components/containers/DiscussionsContainer';
import NotificationCenterContainer from './components/containers/NotificationCenterContainer';
import NotificationClearIconContainer from './components/containers/NotificationClearIconContainer';
import AccountContainer from './components/containers/AccountContainer';
import ProfileContainer from './components/containers/ProfileContainer';
import OnboardContainer from './components/containers/OnboardContainer';
import StartDiscussionContainer from './components/containers/StartDiscussionContainer';
import MyPlacesContainer from './components/containers/MyPlacesContainer';
import PlaceSelectorContainer from './components/containers/PlaceSelectorContainer';
import { config } from '../core-client';

export type RouteDescription = {
	title?: string;
	titleComponent?: ReactClass<any>;
	leftComponent?: ReactClass<any>;
	rightComponent?: ReactClass<any>;
	component: ReactClass<any>;
	type?: 'modal';
}

export default function(route: Route): RouteDescription {
	switch (route.name) {
	case 'room':
		return {
			titleComponent: RoomTitleContainer,
			rightComponent: NotificationIcon,
			component: DiscussionsContainer,
		};
	case 'chat':
		return {
			titleComponent: ChatTitleContainer,
			rightComponent: NotificationIcon,
			component: ChatContainer,
		};
	case 'notes':
		return {
			title: 'Notifications',
			component: NotificationCenterContainer,
			rightComponent: NotificationClearIconContainer,
		};
	case 'profile':
		return {
			title: `${route.props ? route.props.user : 'someone'}'s profile`,
			component: ProfileContainer,
			type: 'modal',
		};
	case 'account':
		return {
			title: 'Account settings',
			component: AccountContainer,
		};
	case 'places':
		return {
			title: 'My places',
			component: MyPlacesContainer,
		};
	case 'addplace':
		return {
			title: 'Add place',
			component: PlaceSelectorContainer,
			type: 'modal',
		};
	case 'details':
		return {
			title: 'Details',
			component: DiscussionsDetailsContainer,
			rightComponent: ShareButtonContainer,
		};
	case 'onboard':
		return {
			title: 'Sign in',
			component: OnboardContainer,
		};
	case 'compose':
		return {
			title: 'Start new discussion',
			component: StartDiscussionContainer,
			type: 'modal',
		};
	default:
		return {
			title: config.app_name,
			leftComponent: ProfileButtonContainer,
			rightComponent: NotificationIcon,
			component: Homescreen,
		};
	}
}
