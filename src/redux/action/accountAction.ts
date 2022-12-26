import { AccountType } from "../../interface";
import { account } from "../constant/types";

export const updateAccount = (dispatch: any, item: AccountType) => {
  dispatch({
    type: account.UPDATE,
    item: item
  })
};

export const updateAccountPwd = (dispatch: any, item: AccountType) => {
  dispatch({
    type: account.UPDATE_PWD,
    item: item
  })
};

export const updateAccountBackup = (dispatch: any, item: AccountType) => {
  dispatch({
    type: account.UPDATE_BACKUP,
    item: item
  })
};

export const addAccount = (dispatch: any, item: AccountType) => {
  dispatch({
    type: account.ADD,
    item: item
  })
};
