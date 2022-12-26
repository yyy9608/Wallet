import { network } from "../constant/types";
import netWorkConfig from '../../config/network.json';

const activeNetwork = (state = JSON.stringify(netWorkConfig[0]), action: any) => {
  let item = action.item;
  switch (action.type) {
    case network.UPDATE:
      state = JSON.stringify(item);
      return state;
    default:
      return state;
  }
};

export default activeNetwork;