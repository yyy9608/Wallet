import { NetworkType } from "../../interface";
import { network } from "../constant/types";

export const addNetwork = (dispatch: any, item: NetworkType) => {
  dispatch({
    type: network.ADD,
    item: item
  })
};

export const delNetwork = (dispatch: any, item: NetworkType) => {
  dispatch({
    type: network.DEL,
    item: item
  })
}

export const updateNetwork = (dispatch: any, item: NetworkType) => {
  dispatch({
    type: network.UPDATE,
    item: item
  })
};