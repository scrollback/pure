/* @flow */
/* eslint-disable react/no-multi-comp */

import React, { PropTypes, Component } from 'react';
import isEmpty from 'lodash/isEmpty';
import shallowCompare from 'react-addons-shallow-compare';
import createContainer from '../../../modules/store/createContainer';
import Onboard from '../views/Onboard/Onboard';
import { validate } from '../../../lib/UserValidator';
import uploadContacts from '../../../modules/contacts/uploadContacts';
import {
	signIn,
	signUp,
	cancelSignUp,
	clearSignUpError,
	saveUser,
} from '../../../modules/store/actions';
import { ERRORS } from '../../../lib/Constants';
import type { User } from '../../../lib/schemaTypes';

type Props = {
	user: ?string;
	me: User;
	pendingUser: {
		signedIdentities: string;
		params: {
			[key: string]: {
				picture?: string;
				name?: string;
			};
		};
		error?: { message: string; code: string };
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
	page: 'PAGE_SIGN_IN' | 'PAGE_USER_DETAILS' | 'PAGE_PLACES' | 'PAGE_GET_STARTED' | 'PAGE_HOME' | 'PAGE_LOADING';
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
		user: PropTypes.string,
		me: PropTypes.shape({
			id: PropTypes.string,
		}),
		pendingUser: PropTypes.shape({
			params: PropTypes.object,
			error: PropTypes.shape({
				message: PropTypes.string,
				code: PropTypes.string,
			}),
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
		return shallowCompare(this, nextProps, nextState);
	}

	_setUserDetails = (props: Props) => {
		const {
			me,
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

				if (isEmpty(fields.places) && me.params && me.params.places) {
					for (const type in me.params.places) {
						const place = me.params.places[type];

						places[type] = {
							placeId: place.id,
							primaryText: place.title,
							secondaryText: place.description,
						};
					}
				}

				let message;

				const { error } = pendingUser;

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

	_setCurrentPage = (props: Props) => {
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
			if (user && me && me.type !== 'loading') {
				if (me.params && me.params.places) {
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

	_isFieldRequired = (field: string) => {
		return [ 'nick', 'name', 'places' ].indexOf(field) > -1;
	};

	_getPageForField = (field: string) => {
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

	_canGoForward = (fields: Fields, page: string): boolean => {
		for (const field in fields) {
			const item = fields[field];

			if (this._getPageForField(field) === page && (item.error || this._isFieldRequired(field) && isEmpty(item.value))) {
				return false;
			}
		}

		return true;
	};

	_ensureAllFields = (fields: Fields): Fields => {
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

	_validateFields = (fields: Fields): Fields => {
		for (const field in fields) {
			const item = fields[field];

			switch (field) {
			case 'nick':
				if (item.value) {
					try {
						validate(item.value);
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

	_onChangeField = (type: string, value: any) => {
		const fields = this._validateFields({ ...this.state.fields, [type]: { value, error: null } });

		this.setState({
			fields,
		});

		if (type === 'nick' && !fields.nick.error) {
			setTimeout(() => {
				this.props.clearSignUpError(this.props.pendingUser);
			}, 0);
		}
	};

	_saveData = (fields: Fields, page: string) => {
		if (!this._canGoForward(fields, page)) {
			return;
		}

		switch (page) {
		case PAGE_USER_DETAILS:
			this.props.signUp(fields.nick.value, fields.name.value, this.props.pendingUser);
			break;
		case PAGE_PLACES:
			this.props.savePlaces(fields.places.value, this.props.me);
			break;
		case PAGE_GET_STARTED:
			this._finishOnboarding(fields.invite.value);
			break;
		}
	};

	_finishOnboarding = (invite: boolean) => {
		this.setState({
			page: PAGE_HOME,
			onboarding: false,
		});

		if (invite) {
			uploadContacts();
		}
	};

	_submitPage = (page: string): void => {
		const fields = this._ensureAllFields(this._validateFields({ ...this.state.fields }));

		this.setState({
			fields,
		}, () => this._saveData(this.state.fields, page));
	};

	_submitUserDetails = (): void => this._submitPage(PAGE_USER_DETAILS);

	_submitPlaceDetails = (): void => this._submitPage(PAGE_PLACES);

	_submitGetStarted = (): void => this._submitPage(PAGE_GET_STARTED);

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

const mapDispatchToProps = dispatch => ({
	clearSignUpError: pendingUser => dispatch(clearSignUpError(pendingUser)),
	signIn: (provider, auth) => dispatch(signIn(provider, auth)),
	cancelSignUp: () => {
		dispatch({ type: 'SIGNOUT' });
		dispatch(cancelSignUp());
	},
	signUp: (id: string, name: string, pendingUser) => {
		const { error, ...user } = pendingUser; // eslint-disable-line no-unused-vars

		dispatch(signUp({
			...user,
			id,
			name,
			meta: {
				description: 'Hey! I just joined Belong.',
			},
		}));
	},
	savePlaces: (results, user) => {
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

		dispatch(saveUser({
			...user,
			params: {
				...params,
				places,
			},
		}));
	},
});

const mapSubscriptionToProps = ({ user }) => {
	const queries = {
		pendingUser: {
			key: {
				type: 'state',
				path: 'signup',
			},
		},
	};

	if (typeof user === 'string') {
		return {
			...queries,
			me: {
				key: {
					type: 'entity',
					id: user,
				},
			},
		};
	}

	return queries;
};

export default createContainer(mapSubscriptionToProps, mapDispatchToProps)(OnboardContainer);
