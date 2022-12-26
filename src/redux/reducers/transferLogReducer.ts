import { TransferLogType } from "../../interface";
import { transferLog } from "../constant/types";

const transferLogReducer = (state = JSON.stringify([]), action: any) => {
  switch (action.type) {
    case transferLog.ADD:
      let new_state_add = JSON.parse(state);
      new_state_add.push(action.item);
      state = JSON.stringify(new_state_add);
      return state;
    case transferLog.UPDATE:
      let new_state_update = JSON.parse(state);
      let index = new_state_update.findIndex((v: TransferLogType) => v.hash === action.item.hash);
      if (index > -1) {
        new_state_update[index].isStatus = action.item.isStatus;
      };
      state = JSON.stringify(new_state_update);
      return state;
    default:
      return state;
  }
};

export default transferLogReducer;