import { BottomSheet, Button } from "@rneui/themed";
import { Text, View, Dimensions, ScrollView, TouchableOpacity } from "react-native";
import { useState } from 'react';
import { globalStyle } from "../styles";
import { connect } from 'react-redux';
import { NetworkType } from "../interface";
import { delNetwork, updateNetwork } from "../redux/action/netWorkAction";
const { mtb1, mt1, tac, fz16, plr1, rowBetween, alignItems, rowItems } = globalStyle;

const NetWorkList = ({ network, activeNetwork, update_activeNetwork, del_network }: any) => {

  const [visible, setVisible] = useState(false);
  const { width: deviceWidth, height: deviceHeight } = Dimensions.get("window");

  return (
    < View >
      <Text onPress={() => setVisible(true)}>网络列表</Text>
      <BottomSheet isVisible={visible} onBackdropPress={() => setVisible(false)}>
        <View style={{ width: deviceWidth, height: Math.floor(deviceHeight / 1.6), backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
          <Text style={{ ...tac, ...mt1, ...fz16 }}>网络列表</Text>
          <View style={{ backgroundColor: '#e8e8e8', width: '100%', height: 1, ...mtb1 }}></View>
          <ScrollView style={{ ...plr1 }}>
            {
              network.map((item: any, index: number) => {
                return (
                  <TouchableOpacity key={index} onPress={() => {
                    update_activeNetwork(item);
                    setVisible(false);
                  }}>
                    <View>
                      <View style={{ ...rowBetween, ...alignItems }}>
                        <View>
                          <Text>{item.name}</Text>
                          <Text>{item.rpc}</Text>
                        </View>
                        <View style={{ ...rowItems }}>
                          {
                            !item.remove
                            &&
                            <Text onPress={() => del_network(item)}>删除</Text>
                          }
                          {
                            item.rpc === activeNetwork.rpc && <Text style={{ width: 16, height: 16, backgroundColor: 'green', borderRadius: 10 }}></Text>
                          }
                        </View>
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
    network: JSON.parse(state.networkList),
    activeNetwork: JSON.parse(state.activeNetwork)
  }
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    update_activeNetwork: (item: NetworkType) => updateNetwork(dispatch, item),
    del_network: (item: NetworkType) => delNetwork(dispatch, item)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(NetWorkList);