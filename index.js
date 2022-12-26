// /**
//  * @format
//  */
import 'react-native-get-random-values';
import '@ethersproject/shims';
// import { AppRegistry } from 'react-native';
// import App from './App';
// import { name as appName } from './app.json';
import buffer from 'buffer';
global.Buffer = buffer.Buffer;

// AppRegistry.registerComponent(appName, () => App);


import { registerRootComponent } from 'expo';
import 'react-native-reanimated';
// import App from './App';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
