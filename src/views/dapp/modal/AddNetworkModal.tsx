import { View, Text, Dimensions, Image } from "react-native";
import { useEffect, useState } from 'react';
import { BottomSheet, Button } from "@rneui/themed";
import { AddNetworkType, AddTokenModalType, NetworkType } from "../../../interface";
import MessageKeys from "../../../utils/browser/MessageKeys";
import { globalStyle } from "../../../styles";
import { MyStyleSheet } from "../../../utils/MyStyleSheet";
const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');
const { p2, rowBetween, mt2, rowCenter, tac, fz20, mt1, fz16, columnBetween, p1 } = globalStyle;

export const AddNetworkModal = ({ event, active_account, active_network }: any) => {

  const [visible, setVisible] = useState(false);
  const [payload, setPayload] = useState<AddNetworkType | any>(null);

  const rejectSwitchNetwork = () => {
    payload.reject();
    setVisible(false);
  };

  const switchNetwork = () => {
    payload.approve();
    setVisible(false);
  };

  useEffect(() => {

    if (!visible) {
      setPayload(null);
    };
  }, [visible])

  useEffect(() => {
    event.on(MessageKeys.openAddNetworkModal, (e: AddNetworkType) => {
      setVisible(true);
      setPayload(e);
    })
  }, []);

  return (
    <BottomSheet isVisible={visible}>
      <View style={{ width: deviceWidth, ...styles.approveContainer, backgroundColor: '#fff', borderTopLeftRadius: 10, borderTopRightRadius: 10, ...p2, ...columnBetween }}>
        <View>
          <Text style={{ ...fz20, color: 'blue', ...tac }}>添加网络</Text>
          <View style={{ width: '100%', height: 1, backgroundColor: 'blue', ...mt1 }} />
          <View style={{ ...rowCenter, ...mt1 }}>
            <Image source={{ uri: payload ? payload.pageMetadata.icon : '' }} style={{ width: 80, height: 80 }} />
            {/* <Image source={{ uri: 'https://cosmictoken.co/favicon.ico' }} style={{ width: 80, height: 80 }} /> */}
          </View>
          <View style={rowCenter}>
            <Text numberOfLines={1} style={{ ...mt1, ...fz16 }}>{payload && payload.pageMetadata.origin}</Text>
          </View>
          <View style={{ width: '100%', ...p1, backgroundColor: '#e8e8e8', ...mt1 }}>
            <Text>NetworkName：{payload && payload.params[0].chainName}</Text>
            <Text>ChainID：{payload && payload.params[0].chainId}</Text>
            <Text>Symbol：{payload && payload.params[0].nativeCurrency.symbol}</Text>
            <Text>Rpc：{payload && payload.params[0].rpcUrls[0]}</Text>
          </View>
        </View>
        <View style={{ ...rowBetween, ...mt2 }}>
          <View style={{ width: '48%' }}>
            <Button title='拒绝' color="warning" onPress={rejectSwitchNetwork} />
          </View>
          <View style={{ width: '48%' }}>
            <Button title='添加' onPress={switchNetwork} />
          </View>
        </View>
      </View>
    </BottomSheet>
  )
};

const styles = MyStyleSheet.create({
  approveContainer: {
    // height: 400
  }
});
