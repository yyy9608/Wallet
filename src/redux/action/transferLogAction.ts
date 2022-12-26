import { TransferLogType } from "../../interface";
import { transferLog } from "../constant/types";

export const addTransferLog = (dispatch: any, item: TransferLogType) => {
  dispatch({
    type: transferLog.ADD,
    item: item
  })
};

export const updateTransferLog = (dispatch: any, item: { hash: string, isStatus: number }) => {
  dispatch({
    type: transferLog.UPDATE,
    item: item
  })
};