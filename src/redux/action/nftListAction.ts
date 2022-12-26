import { BigNumber } from "ethers";
import { NFTListType } from "../../interface";
import { NFTListConstant } from "../constant/types";

export const addNFTList = (dispatch: any, item: NFTListType) => {
  dispatch({
    type: NFTListConstant.ADD,
    item: item
  })
};

export const updateNFTList = (dispatch: any, item: Array<BigNumber>) => {
  dispatch({
    type: NFTListConstant.UPDATE,
    item: item
  })
};
