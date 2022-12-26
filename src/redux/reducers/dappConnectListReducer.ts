import { DAppConnectConstant } from "../constant/types";

const dappConnectListReducer = (state = JSON.stringify([]), action: any) => {
  switch (action.type) {
    case DAppConnectConstant.ADD:

      return state;
    default:
      return state;
  }
};

export default dappConnectListReducer;