import { SwapTransactionLogType } from "../../interface";
import { swapConstant } from "../constant/types";

export const addSwapLog = (dispatch: any, item: SwapTransactionLogType) => {
  dispatch({
    type: swapConstant.ADD,
    item
  })
};