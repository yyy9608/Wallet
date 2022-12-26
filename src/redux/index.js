import { createStore } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
//  存储机制，可换localStorage, sessionStorage等，当前使用storage
import AsyncStorage from '@react-native-community/async-storage';
import rootReducer from './reducers'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

const persistConfig = {
  key: 'root', // 必须有的
  version: '1',
  storage: AsyncStorage, // 缓存机制
  timeout: 40000,
  stateReconciler: autoMergeLevel2 // 查看 'Merge Process' 部分的具体情况
}

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = createStore(
  persistedReducer,
);

export const persistor = persistStore(store);

export default store;