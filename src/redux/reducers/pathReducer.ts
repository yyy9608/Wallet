import { path } from "../constant/types";

const pathReducer = (state = 0,  action: any) => {
  switch (action.type) {
    case path.ADD:
      state = state + 1;
      return state;
    default:
      return state;
  }
};

export default pathReducer;