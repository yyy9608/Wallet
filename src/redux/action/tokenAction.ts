import { TokenType } from "../../interface";
import { token } from "../constant/types";

export const addToken = (dispatch: any, item: TokenType) => {
  dispatch({
    type: token.ADD,
    item: item
  })
};