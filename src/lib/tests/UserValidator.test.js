import test from 'ava';
import { validate } from '../UserValidator';

test('should throw error when not string', t => {
	t.throws(() => validate(), 'must be a string');
	t.throws(() => validate(null), 'must be a string');
	t.throws(() => validate({}), 'must be a string');
	t.throws(() => validate(123), 'must be a string');
});

test('should throw error when empty', t => {
	t.throws(() => validate(''), 'cannot be empty');
});

test('should throw error when has spaces', t => {
	t.throws(() => validate('abc '), 'cannot have spaces');
	t.throws(() => validate('a bc'), 'cannot have spaces');
	t.throws(() => validate(' abc'), 'cannot have spaces');
});

test('should throw error when has anything except letters, numbers and hyphens', t => {
	t.throws(() => validate('ab*c'), 'can have only letters, numbers and hyphens (-)');
	t.throws(() => validate('a!bc'), 'can have only letters, numbers and hyphens (-)');
});

test('should throw error when length is less than 3', t => {
	t.throws(() => validate('ab'), 'should be more than 3 characters long');
});

test('should throw error when length is more than 32', t => {
	t.throws(() => validate('abc234567890123456789012345678901'), 'should be less than 32 characters long');
});

test('should throw error when starts with anything other than letters or numbers', t => {
	t.throws(() => validate('-abc'), 'must start with a letter or number');
});

test('should throw error when doesn\'t have at least 1 letter', t => {
	t.throws(() => validate('123'), 'should have at least 1 letter');
	t.throws(() => validate('1-2345'), 'should have at least 1 letter');
});

test('should throw error when reserved word', t => {
	t.throws(() => validate('undefined'), 'cannot be a reserved word');
	t.throws(() => validate('null'), 'cannot be a reserved word');
	t.throws(() => validate('group'), 'cannot be a reserved word');
	t.throws(() => validate('room'), 'cannot be a reserved word');
	t.throws(() => validate('user'), 'cannot be a reserved word');
	t.throws(() => validate('thread'), 'cannot be a reserved word');
	t.throws(() => validate('entity'), 'cannot be a reserved word');
	t.throws(() => validate('admin'), 'cannot be a reserved word');
	t.throws(() => validate('owner'), 'cannot be a reserved word');
	t.throws(() => validate('root'), 'cannot be a reserved word');
	t.throws(() => validate('moderator'), 'cannot be a reserved word');
	t.throws(() => validate('mod'), 'cannot be a reserved word');
	t.throws(() => validate('missing'), 'cannot be a reserved word');
	t.throws(() => validate('loading'), 'cannot be a reserved word');
	t.throws(() => validate('failed'), 'cannot be a reserved word');
	t.throws(() => validate('error'), 'cannot be a reserved word');
});

test('should not throw error when valid', t => {
	t.notThrows(() => validate('abc'));
	t.notThrows(() => validate('123abc'));
	t.notThrows(() => validate('123-abc'));
	t.notThrows(() => validate('abc-123'));
});
