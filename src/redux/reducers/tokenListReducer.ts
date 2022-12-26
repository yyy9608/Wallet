import { token } from "../constant/types";

const tokenList = (state = JSON.stringify([]), action: any) => {
  switch (action.type) {
    case token.ADD:
      let new_state = JSON.parse(state);
      new_state.push(action.item);
      state = JSON.stringify(new_state);
      return state;
    default:
      return state;
  }
};

export default tokenList;