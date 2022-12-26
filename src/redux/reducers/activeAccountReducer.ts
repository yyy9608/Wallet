import { account } from "../constant/types";

const activeAccount = (state = JSON.stringify({}), action: any) => {
  let item = action.item;
  switch (action.type) {
    case account.UPDATE:
      state = JSON.stringify(item);
      return state;
    case account.UPDATE_PWD:
      state = JSON.stringify(action.item);
      return state;
    case account.UPDATE_BACKUP:
      state = JSON.stringify(action.item);
      return state;
    default:
      return state;
  }
};

export default activeAccount;