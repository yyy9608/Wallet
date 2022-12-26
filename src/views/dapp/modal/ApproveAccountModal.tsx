import { View, Text, Dimensions, Image, ScrollView } from "react-native";
import { useEffect, useState } from 'react';
import { BottomSheet, Button } from "@rneui/themed";
import { ApproveType } from "../../../interface";
import MessageKeys from "../../../utils/browser/MessageKeys";
import { globalStyle } from "../../../styles";
import { splitAddress } from "../../../utils/wallet";
import { MyStyleSheet } from "../../../utils/MyStyleSheet";
import VerifyPasswordModal from "../../../components/Verify-Password-Modal";
const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');
const { p2, rowBetween, rowItems, ml1, rowCenter, plr1, mt4, tac, fz20, fw550, mt1, fz16, pb1 } = globalStyle;

export const ApproveAccountModal = ({ event, active_account, active_network }: any) => {

  const [visible, setVisible] = useState(false);
  const [payload, setPayload] = useState<ApproveType | any>(null);
  const [verifyPwdVisible, setVerifyPwdVisible] = useState(false);

  const rejectConnect = () => {
    payload.reject();
    setVisible(false);
  };

  const connect = (bool?: Boolean) => {
    if (!bool) {
      setVerifyPwdVisible(true);
      return;
    }
    payload.approve([active_account.address]);
    setVisible(false);
  };

  useEffect(() => {
    if (!visible) setPayload(null);
  }, [visible])

  useEffect(() => {
    event.on(MessageKeys.openApproveLoginModal, (e: ApproveType) => {
      setVisible(true);
      setPayload(e);
    })
  }, []);

  return (
    <BottomSheet isVisible={visible}>
      <ScrollView style={{ ...styles.approveContainer, backgroundColor: '#fff', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
        <View style={{ width: deviceWidth, ...p2 }}>
          <View style={{ ...rowBetween }}>
            <View style={{ ...rowItems }}>
              <View style={{ width: 20, height: 20, backgroundColor: '#ff00002e', borderRadius: 10 }}></View>
              <Text style={ml1}>{splitAddress(active_account.address, 6)}</Text>
            </View>
            <View style={{ ...rowCenter }}>
              <Text style={{ borderColor: '#ff00002e', borderWidth: 1, ...plr1, borderRadius: 40, color: '#ff00002e', paddingTop: 5, paddingBottom: 5 }}>{active_network.name}</Text>
            </View>
          </View>
          {/* https://cosmictoken.co/favicon.ico */}
          <View style={{ ...mt4, ...rowCenter }}>
            <Image source={{ uri: payload ? payload.pageMetadata.icon : '' }} style={{ width: 80, height: 80 }} />
          </View>
          <Text style={{ ...tac, ...fz20, ...fw550, ...mt1 }}>{payload && payload.pageMetadata.title}</Text>
          <View style={rowCenter}>
            <Text numberOfLines={1} ellipsizeMode='middle' style={{ ...mt1, ...fz16 }}>{payload && payload.pageMetadata.origin}</Text>
          </View>
          <View style={rowCenter}>
            <Text numberOfLines={1} style={{ ...mt1 }}>{payload && payload.pageMetadata.desc}</Text>
          </View>
          <View style={mt4}>
            <Button title="拒绝" color="warning" onPress={rejectConnect} />
          </View>
          <View style={mt1}>
            <Button title="连接" onPress={() => connect()} />
          </View>
        </View>
      </ScrollView>
      {verifyPwdVisible && <VerifyPasswordModal visible={verifyPwdVisible} setVisible={setVerifyPwdVisible} cb={connect} />}
    </BottomSheet >
  )
};

const styles = MyStyleSheet.create({
  approveContainer: {
    // height: 400
  }
});
