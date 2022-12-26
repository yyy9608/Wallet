import Toast from "react-native-root-toast";
import { NFTListType } from "../../interface";
import { NFTListConstant } from "../constant/types";

const nftListReducer = (state = JSON.stringify([]), action: any) => {
  let store = JSON.parse(state);

  switch (action.type) {
    case NFTListConstant.ADD:
      let idx = store.findIndex((v: NFTListType) => v.contract === action.item.contract);
      if (idx === -1) {
        store.push(action.item);
        state = JSON.stringify(store);
      } else {
        Toast.show('NFT 合约已存在');
      }
      return state;
    case NFTListConstant.UPDATE:
      store.forEach((item: NFTListType, index: number) => {
        store[index].balance = action.item[index].toNumber();
      })
      state = JSON.stringify(store);
      return state;
    case NFTListConstant.UPDATE_ITEM:
      let index = store.findIndex((v: NFTListType) => v.contract === action.item.contract);
      if (index > -1) {
        store[index].balance = action.item.balance;
        state = JSON.stringify(store);
      }
      return state;
    default:
      return state;
  }
};

export default nftListReducer;