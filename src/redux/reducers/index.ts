import { combineReducers } from 'redux';
import networkList from './NetworkListReducer';
import activeNetwork from './activeNetwork';
import accountList from './accountListReducer';
import activeAccount from './activeAccountReducer';
import tokenList from './tokenListReducer';
import pathReducer from './pathReducer';
import transferLogReducer from './transferLogReducer';
import nftListReducer from './nftListReducer';
import swapLogReducer from './swapLogReducer';

export default combineReducers({
  networkList,
  activeNetwork,
  accountList,
  activeAccount,
  tokenList,
  pathReducer,
  transferLogReducer,
  nftListReducer,
  swapLogReducer
});