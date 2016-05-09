/* @flow */
/* eslint-disable react/no-multi-comp */

import React, { PropTypes, Component } from 'react';
import isEmpty from 'lodash/isEmpty';
import shallowEqual from 'shallowequal';
import Connect from '../../../modules/store/Connect';
import Onboard from '../views/Onboard/Onboard';
import Validator from '../../../lib/Validator';
import uploadContacts from '../../../modules/contacts/uploadContacts';
import { signIn, signUp, cancelSignUp, clearSignUpError, saveUser } from '../../../modules/store/actions';
import { ERRORS } from '../../../lib/Constants';
import type { User } from '../../../lib/schemaTypes';

type Props = {
	me: ?string;
	user: User;
	error?: { message: string; code: string };
	pendingUser: {
		signedIdentities: string;
		params: {
			[key: string]: {
				picture?: string;
				name?: string;
			};
		};
	};
	signIn: Function;
	signUp: Function;
	cancelSignUp: Function;
	savePlaces: Function;
	clearSignUpError: Function;
}

type Fields = {
	[key: string]: {
		value: any;
		error: ?string
	};
}

type State = {
	fields: Fields;
	page: string;
	onboarding: boolean;
}

const PAGE_LOADING = 'PAGE_LOADING';
const PAGE_SIGN_IN = 'PAGE_SIGN_IN';
const PAGE_USER_DETAILS = 'PAGE_USER_DETAILS';
const PAGE_PLACES = 'PAGE_PLACES';
const PAGE_GET_STARTED = 'PAGE_GET_STARTED';
const PAGE_HOME = 'PAGE_HOME';

const FIELD_NAMES = {
	nick: 'Username',
	name: 'Fullname',
	picture: 'Profile picture',
	places: 'Places',
};

class OnboardContainer extends Component<void, Props, State> {
	static propTypes = {
		me: PropTypes.string,
		user: PropTypes.shape({
			id: PropTypes.string,
		}),
		error: PropTypes.shape({
			message: PropTypes.string,
			code: PropTypes.string,
		}),
		pendingUser: PropTypes.shape({
			params: PropTypes.object,
		}),
		signIn: PropTypes.func.isRequired,
		signUp: PropTypes.func.isRequired,
		cancelSignUp: PropTypes.func.isRequired,
		savePlaces: PropTypes.func.isRequired,
		clearSignUpError: PropTypes.func.isRequired,
	};

	state: State = {
		fields: {
			nick: { value: '', error: null },
			name: { value: '', error: null },
			picture: { value: '', error: null },
			places: { value: {}, error: null },
			invite: { value: true, error: null },
		},
		page: PAGE_LOADING,
		onboarding: false,
	};

	componentWillMount() {
		this._setCurrentPage(this.props);
	}

	componentWillReceiveProps(nextProps: Props) {
		this._setCurrentPage(nextProps);
		this._setUserDetails(nextProps);
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
	}

	_setUserDetails: Function = (props: Props) => {
		const {
			user,
			error,
			pendingUser,
		} = props;

		if (!pendingUser) {
			return;
		}

		const { params } = pendingUser;

		for (const provider in params) {
			const data = params[provider];

			if (data) {
				const { fields } = this.state;

				const places = {};

				if (isEmpty(fields.places) && user.params && user.params.places) {
					for (const type in user.params.places) {
						const place = user.params.places[type];

						places[type] = {
							placeId: place.id,
							primaryText: place.title,
							secondaryText: place.description,
						};
					}
				}

				let message;

				if (error) {
					if (error.message) {
						message = error.message;
					} else {
						message = ERRORS[error.code] || 'An unknown error occured!';
					}
				} else {
					message = null;
				}

				this.setState({
					fields: {
						...fields,
						nick: { value: fields.nick.value, error: message },
						name: { value: fields.name.value || data.name, error: null },
						picture: { value: fields.picture.value || data.picture, error: null },
						places: { value: isEmpty(fields.places) ? places : fields.places, error: null },
					},
				});

				break;
			}
		}
	};

	_setCurrentPage: Function = (props: Props) => {
		const {
			me,
			user,
			pendingUser,
		} = props;

		if (pendingUser) {
			// Signing up
			this.setState({
				page: PAGE_USER_DETAILS,
				onboarding: true,
			});
		} else {
			if (me && user && user.type !== 'loading') {
				if (user.params && user.params.places) {
					if (this.state.onboarding) {
						this.setState({
							page: PAGE_GET_STARTED,
						});
					} else {
						this.setState({
							page: PAGE_HOME,
						});
					}
				} else {
					this.setState({
						page: PAGE_PLACES,
						onboarding: true,
					});
				}
			} else {
				this.setState({
					page: PAGE_SIGN_IN,
				});
			}
		}
	};

	_isFieldRequired: Function = (field: string) => {
		return [ 'nick', 'name', 'places' ].indexOf(field) > -1;
	};

	_getPageForField: Function = (field: string) => {
		switch (field) {
		case 'nick':
		case 'name':
		case 'picture':
			return PAGE_USER_DETAILS;
		case 'places':
			return PAGE_PLACES;
		case 'invite':
			return PAGE_GET_STARTED;
		default:
			return PAGE_HOME;
		}
	};

	_canGoForward: Function = (fields: Fields, page: string): boolean => {
		for (const field in fields) {
			const item = fields[field];

			if (this._getPageForField(field) === page && (item.error || this._isFieldRequired(field) && isEmpty(item.value))) {
				return false;
			}
		}

		return true;
	};

	_ensureAllFields: Function = (fields: Fields): Fields => {
		for (const field in fields) {
			const item = fields[field];

			if (this._isFieldRequired(field) && isEmpty(item.value)) {
				fields[field] = {
					...item,
					error: FIELD_NAMES[field] + ' must be specified',
				};
			}
		}

		return fields;
	};

	_validateFields: Function = (fields: Fields): Fields => {
		for (const field in fields) {
			const item = fields[field];

			switch (field) {
			case 'nick':
				if (item.value) {
					try {
						Validator.validate(item.value);
					} catch (e) {
						fields[field] = {
							...item,
							error: FIELD_NAMES.nick + ' ' + e.message,
						};
					}
				}
				break;
			}
		}

		return fields;
	};

	_onChangeField: Function = (type: string, value: any) => {
		const fields = this._validateFields({ ...this.state.fields, [type]: { value, error: null } });

		this.setState({
			fields,
		});

		if (type === 'nick' && !fields.nick.error) {
			setTimeout(() => {
				this.props.clearSignUpError();
			}, 0);
		}
	};

	_saveData: Function = (fields: Fields, page: string) => {
		if (!this._canGoForward(fields, page)) {
			return;
		}

		switch (page) {
		case PAGE_USER_DETAILS:
			this.props.signUp(fields.nick.value, fields.name.value);
			break;
		case PAGE_PLACES:
			this.props.savePlaces(fields.places.value);
			break;
		case PAGE_GET_STARTED:
			this._finishOnboarding(fields.invite.value);
			break;
		}
	};

	_finishOnboarding: Function = (invite: boolean) => {
		this.setState({
			page: PAGE_HOME,
			onboarding: false,
		});

		if (invite) {
			uploadContacts();
		}
	};

	_submitPage: Function = (page: string): void => {
		const fields = this._ensureAllFields(this._validateFields({ ...this.state.fields }));

		this.setState({
			fields,
		}, () => this._saveData(this.state.fields, page));
	};

	_submitUserDetails: Function = (): void => this._submitPage(PAGE_USER_DETAILS);

	_submitPlaceDetails: Function = (): void => this._submitPage(PAGE_PLACES);

	_submitGetStarted: Function = (): void => this._submitPage(PAGE_GET_STARTED);

	render() {
		return (
			<Onboard
				{...this.props}
				{...this.state}
				canGoForward={this._canGoForward(this.state.fields, this.state.page)}
				submitUserDetails={this._submitUserDetails}
				submitPlaceDetails={this._submitPlaceDetails}
				submitGetStarted={this._submitGetStarted}
				onChangeField={this._onChangeField}
			/>
		);
	}
}

const mapActionsToProps = {
	clearSignUpError: (store, result) => () => store.dispatch(clearSignUpError(result.pendingUser)),
	signIn: (store) => (provider, auth) => store.dispatch(signIn(provider, auth)),
	cancelSignUp: (store) => () => store.dispatch(cancelSignUp()),
	signUp: (store, result) => (id: string, name: string) => {
		const { error, ...user } = result.pendingUser; // eslint-disable-line no-unused-vars

		store.dispatch(signUp({
			...user,
			id,
			name,
			meta: {
				description: 'Hey! I just joined Belong.',
			},
		}));
	},
	savePlaces: (store, result) => results => {
		const {
			user,
		} = result;

		const params = user.params ? { ...user.params } : {};
		const places = params.places ? { ...params.places } : {};

		for (const type in results) {
			const place = results[type];

			places[type] = {
				id: place.placeId,
				description: place.secondaryText,
				title: place.primaryText,
			};
		}

		store.dispatch(saveUser({
			...result.user,
			params: {
				...params,
				places,
			},
		}));
	},
};

const mapSubscriptionToProps = {
	pendingUser: {
		key: {
			type: 'state',
			path: 'signup',
		},
	},
	error: {
		key: {
			type: 'state',
			path: 'signup',
		},
		transform: signup => signup ? signup.error : null,
	},
};

export default class OnboardContainerOuter extends Component<void, { user: ?string }, void> {
	static propTypes = {
		user: PropTypes.string,
	};

	render() {
		const { user } = this.props;

		return (
			<Connect
				mapActionsToProps={mapActionsToProps}
				mapSubscriptionToProps={typeof user === 'string' ? {
					...mapSubscriptionToProps,
					user: {
						key: {
							type: 'entity',
							id: user,
						},
					},
				} : mapSubscriptionToProps}
				component={OnboardContainer}
				passProps={{ me: this.props.user }}
			/>
		);
	}
}
