import { swapConstant } from "../constant/types";


const swapLogReducer = (state = JSON.stringify([]), action: any) => {
  let new_state = JSON.parse(state);
  switch (action.type) {
    case swapConstant.ADD:
      new_state.push(action.item);
      state = JSON.stringify(new_state);
      return state;
    default:
      return state;
  }
};

export default swapLogReducer;