import test from 'ava';
import createPaginatedContainer from '../createPaginatedContainer';

test('should set displayName', t => {
	const MyComponent = () => null; // eslint-disable-line
	const Container = createPaginatedContainer({}, 20)(MyComponent);

	t.is(Container.displayName, 'PaginatedContainer$MyComponent');
});
