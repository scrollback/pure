import 'react-native-mock/mock';
import mockery from 'mockery';

global.__DEV__ = true;

mockery.enable();
mockery.warnOnUnregistered(false);

mockery.registerMock('react-native-vector-icons/MaterialIcons', () => null);
mockery.registerMock('react-native-vector-icons/EvilIcons', () => null);
mockery.registerMock('react-native-fbsdk', {});
