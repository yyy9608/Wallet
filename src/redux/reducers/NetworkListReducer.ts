import { network } from "../constant/types";
import netWorkConfig from '../../config/network.json';
import { Alert } from "react-native";

const networkList = (state = JSON.stringify(netWorkConfig), action: any) => {
  let item = action.item;
  switch (action.type) {
    case network.ADD:
      let new_list = JSON.parse(state);
      let idx = new_list.findIndex((v: any) => v.rpc === item.rpc);
      if (idx > -1) {
        Alert.alert('rpc 已存在');
        return;
      };
      new_list.push(item);
      state = JSON.stringify(new_list);
      return state;
    case network.DEL:
      let new_state = JSON.parse(state);
      let index = new_state.findIndex((v: any) => v.rpc === item.rpc);
      new_state.splice(index, 1);
      state = JSON.stringify(new_state);
      return state;
    default:
      return state;
  }
};

export default networkList;