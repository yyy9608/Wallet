import { BottomSheet, Button } from "@rneui/themed";
import { Text, View, Dimensions, ScrollView, TouchableOpacity } from "react-native";
import { useState } from 'react';
import { globalStyle } from "../styles";
import { connect } from 'react-redux';
import { AccountType } from "../interface";
import { updateAccount } from "../redux/action/accountAction";
import { splitAddress } from "../utils/wallet";

const { mtb1, mt1, tac, fz16, plr1, rowBetween, alignItems } = globalStyle;
const AccountListModal = ({ activeAccount, account, update_activeAccount }: any) => {

  const [visible, setVisible] = useState(false);
  const { width: deviceWidth, height: deviceHeight } = Dimensions.get("window");

  return (
    < View >
      <Text onPress={() => setVisible(true)}>钱包列表</Text>
      <BottomSheet isVisible={visible} onBackdropPress={() => setVisible(false)}>
        <View style={{ width: deviceWidth, height: Math.floor(deviceHeight / 1.6), backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
          <Text style={{ ...tac, ...mt1, ...fz16 }}>钱包列表</Text>
          <View style={{ backgroundColor: '#e8e8e8', width: '100%', height: 1, ...mtb1 }}></View>
          <ScrollView style={{ ...plr1 }}>
            {
              account.map((item: any, index: number) => {
                return (
                  <TouchableOpacity key={index} onPress={() => {
                    update_activeAccount(item);
                    setVisible(false);
                  }}>
                    <View>
                      <View style={{ ...rowBetween, ...alignItems }}>
                        <View>
                          <Text>{item.accountName}</Text>
                          <Text>{splitAddress(item.address)}</Text>
                        </View>
                        {
                          item.privateKey === activeAccount.privateKey && <Text style={{ width: 16, height: 16, backgroundColor: 'green', borderRadius: 10 }}></Text>
                        }
                      </View>
                      <View style={{ backgroundColor: '#e8e8e8', width: '100%', height: 1, ...mtb1 }}></View>
                    </View>
                  </TouchableOpacity>
                )
              })
            }
          </ScrollView>
        </View>
      </BottomSheet >
    </ View >
  )
};

const mapStateToProps = (state: any) => {
  return {
    account: JSON.parse(state.accountList),
    activeAccount: JSON.parse(state.activeAccount)
  }
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    update_activeAccount: (item: AccountType) => updateAccount(dispatch, item)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountListModal);