import test from 'ava';
import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import Connect from '../Connect';
import Provider from '../Provider';

test('should render component with no data', t => {
	t.plan(1);

	const TextComponent = ({ text }) => <span>{text}</span>; // eslint-disable-line
	const store = {
		subscribe: () => null,
	};
	const wrapper = mount(
		<Provider store={store}>
			<Connect component={TextComponent} passProps={{ text: 'Hey!' }} />
		</Provider>
	);

	t.is(wrapper.text(), 'Hey!');
});

test('should not render connected component without data', t => {
	t.plan(2);

	const NameComponent = ({ name }) => <span>{name}</span>; // eslint-disable-line react/prop-types

	const store = {
		subscribe: options => {
			t.is(options.type, 'name');
		},
	};

	const wrapper = mount(
		<Provider store={store}>
			<Connect
				mapSubscriptionToProps={{ name: 'name' }}
				component={NameComponent}
			/>
		</Provider>
	);

	t.is(wrapper.html(), null);
});

test('should update connected component with data', t => {
	t.plan(5);

	const NameComponent = ({ firstName, middleName, lastName }) => <span>{firstName} {middleName} {lastName}</span>; // eslint-disable-line react/prop-types

	let firstNameCallback;
	let middleNameCallback;
	let lastNameCallback;

	const store = {
		subscribe: (options, cb) => {
			switch (options.type) {
			case 'f':
				firstNameCallback = cb;
				break;
			case 'm':
				middleNameCallback = cb;
				break;
			case 'l':
				lastNameCallback = cb;
				break;
			}
		},
	};

	const wrapper = mount(
		<Provider store={store}>
			<Connect
				mapSubscriptionToProps={{
					firstName: 'f',
					middleName: {
						key: 'm',
						transform: name => name ? `'${name}'` : '',
					},
					lastName: {
						key: {
							type: 'l',
						},
					},
				}}
				component={NameComponent}
			/>
		</Provider>
	);

	firstNameCallback('');
	middleNameCallback('');
	lastNameCallback('');

	t.is(wrapper.text(), '  ');
	firstNameCallback('first');
	t.is(wrapper.text(), 'first  ');
	middleNameCallback('middle');
	t.is(wrapper.text(), 'first \'middle\' ');
	lastNameCallback('last');
	t.is(wrapper.text(), 'first \'middle\' last');
	middleNameCallback('hey');
	t.is(wrapper.text(), 'first \'hey\' last');
});

test('should remove subscription on unmount', t => {
	t.plan(1);

	const container = document.createElement('div');
	const remove = () => t.pass();
	const TextComponent = ({ textContent }) => <span>{textContent}</span>; // eslint-disable-line react/prop-types
	const store = {
		subscribe: options => options.type === 'text' && { remove },
	};

	ReactDOM.render(
		<Provider store={store}>
			<Connect mapSubscriptionToProps={{ textContent: 'text' }} component={TextComponent} />
		</Provider>,
		container
	);

	ReactDOM.unmountComponentAtNode(container);
});

test('should pass dispatch', t => {
	t.plan(1);

	const TEST_ACTION = { type: 'TEST' };
	const ButtonComponent = ({ ping }) => <button onClick={ping} />; // eslint-disable-line react/prop-types
	const dispatch = action => {
		t.is(action, TEST_ACTION);
	};
	const store = {
		subscribe: () => null,
		dispatch,
	};

	const wrapper = mount(
		<Provider store={store}>
			<Connect
				mapActionsToProps={{
					ping: s => () => s.dispatch(TEST_ACTION),
				}}
				component={ButtonComponent}
			/>
		</Provider>
	);

	wrapper.find('button').simulate('click');
});

test('should pass dispatch and data', t => {
	t.plan(3);

	const ButtonComponent = ({ initialLabel, label, click }) => <button onClick={click}>{label || initialLabel}</button>; // eslint-disable-line react/prop-types

	let callback;

	const store = {
		subscribe: (options, cb) => {
			callback = options.type === 'label' ? cb : null;
			return {
				remove: () => (callback = null),
			};
		},
		dispatch: action => action.type === 'CLICK' ? callback(action.payload.label) : null,
	};

	const TestComponent = ({ sub }) => ( // eslint-disable-line react/prop-types
		<Connect
			mapSubscriptionToProps={{
				label: {
					key: sub,
				},
			}}
			mapActionsToProps={{
				click: s => () => s.dispatch({
					type: 'CLICK',
					payload: {
						label: 'Clicked',
					},
				}),
			}}
			passProps={{ initialLabel: 'Hello' }}
			component={ButtonComponent}
		/>
	);

	const wrapper = mount(
		<Provider store={store}>
			<TestComponent sub='label' />
		</Provider>
	);

	callback(undefined); // eslint-disable-line no-undefined

	t.is(wrapper.text(), 'Hello');

	callback('Click me');

	t.is(wrapper.text(), 'Click me');

	wrapper.find('button').simulate('click');

	t.is(wrapper.text(), 'Clicked');
});
