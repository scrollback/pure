/* eslint-disable import/no-commonjs */

import mock from 'mock-require';

mock('react-native', require('react-native-mock'));
mock('react-native-vector-icons/MaterialIcons', () => null);
