
import { Dimensions, StyleSheet } from "react-native";

export const dp2px = (uiElementPx: number) => {
  const deviceWidthDp = Dimensions.get("window").width;
  // 默认设计稿375
  const uiWidthPx = 375;
  return (uiElementPx * deviceWidthDp) / uiWidthPx;
}


export let MyStyleSheet = {
  create(style: any) {
    let s = { ...style };
    // 目前仅对以下的属性进行处理
    let list = [
      "width",
      "height",
      "margin",
      "marginTop",
      "marginBottom",
      "marginLeft",
      "marginRight",
      "padding",
      "paddingTop",
      "paddingRight",
      "paddingBottom",
      "paddingLeft",
      "top",
      "right",
      "bottom",
      "left",
      "fontSize",
      "lineHeight",
    ];
    for (var outKey in s) {
      for (var innerKey in s[outKey]) {
        if (
          list.includes(innerKey) &&
          typeof s[outKey][innerKey] == "number"
        ) {
          s[outKey][innerKey] = dp2px(s[outKey][innerKey]);
        }
      }
    }
    return StyleSheet.create(s);
  }
};