import { View, Text, Dimensions, Image } from "react-native";
import { useEffect, useState } from 'react';
import { BottomSheet, Button } from "@rneui/themed";
import { NetworkType, SwitchNetworkType } from "../../../interface";
import MessageKeys from "../../../utils/browser/MessageKeys";
import { globalStyle } from "../../../styles";
import { MyStyleSheet } from "../../../utils/MyStyleSheet";
import { BigNumber } from "ethers";
import $store from '../../../redux/index';
const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');
const { p2, rowBetween, rowCenter, tac, fz20, mt1, fz16, mt2, columnBetween, tar } = globalStyle;

export const SwitchNetworkModal = ({ event, active_account, active_network, network_list }: any) => {

  const [visible, setVisible] = useState(false);
  const [payload, setPayload] = useState<SwitchNetworkType | any>(null);
  const [toNetwork, setToNetwork] = useState<NetworkType | any>(null);

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
      setToNetwork({});
    };
  }, [visible])

  useEffect(() => {
    event.on(MessageKeys.openSwitchNetworkModal, (e: SwitchNetworkType) => {
      let store = $store.getState();
      let _network = JSON.parse(store.networkList);
      let index = _network.findIndex((v: NetworkType) => v.chainID === BigNumber.from(e.params[0].chainId).toString());
      setToNetwork(_network[index]);
      setVisible(true);
      setPayload(e);
    })
  }, []);

  return (
    <BottomSheet isVisible={visible}>
      <View style={{ width: deviceWidth, ...styles.approveContainer, backgroundColor: '#fff', borderTopLeftRadius: 10, borderTopRightRadius: 10, ...p2, ...columnBetween }}>
        <View>
          <Text style={{ ...fz20, color: 'blue', ...tac }}>切换网络</Text>
          <View style={{ width: '100%', height: 1, backgroundColor: 'blue', ...mt1 }} />
          <View style={{ ...rowCenter, ...mt1 }}>
          <Image source={{ uri: payload ? payload.pageMetadata.icon : '' }} style={{ width: 80, height: 80 }} />
            {/* <Image source={{ uri: 'https://cosmictoken.co/favicon.ico' }} style={{ width: 80, height: 80 }} /> */}
          </View>
          <View style={rowCenter}>
            <Text numberOfLines={1} style={{ ...mt1, ...fz16 }}>{payload && payload.pageMetadata.origin}</Text>
          </View>
          <View style={{ ...mt2, display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
            <Text style={{ flex: 4 }} numberOfLines={2}>{active_network.name}</Text>
            <Text style={{ flex: 2, ...tac }}>➡</Text>
            <Text style={{ flex: 4, ...tar }} numberOfLines={3}>{toNetwork && toNetwork.name}</Text>
          </View>
        </View>
        <View style={rowBetween}>
          <View style={{ width: '48%' }}>
            <Button title='拒绝' color="warning" onPress={rejectSwitchNetwork} />
          </View>
          <View style={{ width: '48%' }}>
            <Button title='切换' onPress={switchNetwork} />
          </View>
        </View>
      </View>
    </BottomSheet>
  )
};

const styles = MyStyleSheet.create({
  approveContainer: {
    height: 400
  }
});
