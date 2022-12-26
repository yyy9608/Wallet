import { ethers } from "ethers";
import { AccountType } from "../../interface";
import { account } from "../constant/types";



const accountList = (state = JSON.stringify([]), action: any) => {
  let new_state = JSON.parse(state);
  switch (action.type) {
    case account.ADD:
      new_state.push(action.item);
      state = JSON.stringify(new_state);
      return state;
    case account.UPDATE_PWD:
      let index = new_state.findIndex((v: AccountType) => v.address === action.item.address);
      if (index > -1) {
        new_state[index] = action.item;
      };
      state = JSON.stringify(new_state);
      return state;
    case account.UPDATE_BACKUP:
      let idx = new_state.findIndex((v: AccountType) => v.address === action.item.address);
      if (idx > -1) {
        new_state[idx].backup = false;
      }
      state = JSON.stringify(new_state);
      return state;
    default:
      return state;
  }
}

export default accountList;