import { View, Text, Dimensions, Image } from "react-native";
import { useEffect, useState } from 'react';
import { BottomSheet, Button } from "@rneui/themed";
import { ApproveType } from "../../../interface";
import MessageKeys from "../../../utils/browser/MessageKeys";
import { globalStyle } from "../../../styles";
import { splitAddress } from "../../../utils/wallet";
import { MyStyleSheet } from "../../../utils/MyStyleSheet";
import VerifyPasswordModal from "../../../components/Verify-Password-Modal";
const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');
const { p2, rowBetween, rowItems, ml1, rowCenter, plr1, mt2, tac, fz20, fw550, mt1, fz16, pb1, fz18, p1 } = globalStyle;

export const ApproveSigntureModal = ({ event, active_account, active_network }: any) => {

  const [visible, setVisible] = useState(false);
  const [payload, setPayload] = useState<ApproveType | any>(null);
  const [verifyPwdVisible, setVerifyPwdVisible] = useState(false);

  const rejectSignture = () => {
    payload.reject();
    setVisible(false);
  };

  const signture = (bool?: Boolean) => {
    if (!bool) {
      setVerifyPwdVisible(true);
      return;
    };
    payload.approve();
    setVisible(false);
  };

  useEffect(() => {
    if (!visible) setPayload(null);
  }, [visible])

  useEffect(() => {
    event.on(MessageKeys.openApproveSignModal, (e: ApproveType) => {
      setVisible(true);
      setPayload(e);
    })
  }, []);

  return (
    <BottomSheet isVisible={visible}>
      <View style={{ width: deviceWidth, ...styles.approveContainer, backgroundColor: '#fff', borderTopLeftRadius: 10, borderTopRightRadius: 10, ...p2 }}>
        <View style={{ ...rowBetween }}>
          <View style={{ ...rowItems }}>
            <View style={{ width: 20, height: 20, backgroundColor: 'blue', borderRadius: 10 }}></View>
            <Text style={ml1}>{splitAddress(active_account.address, 6)}</Text>
          </View>
          <View style={{ ...rowCenter }}>
            <Text style={{ color: 'blue', ...fz18, ...fw550 }}>消息签名</Text>
          </View>
        </View>
        <View style={{ width: '100%', height: 1, backgroundColor: '#e8e8e8', ...mt1 }} />
        <View style={{ ...mt2, ...rowCenter }}>
          <Image source={{ uri: payload ? payload.pageMetadata.icon : '' }} style={{ width: 80, height: 80 }} />
        </View>
        <Text style={{ ...tac, ...fz20, ...fw550, ...mt1 }}>{payload && payload.pageMetadata.title}</Text>
        <View style={rowCenter}>
          <Text numberOfLines={1} style={{ ...mt1, ...fz16 }}>{payload && payload.pageMetadata.origin}</Text>
        </View>
        <Text style={{ color: 'blue', ...tac, ...mt1, ...fz16 }}>签名数据</Text>
        <View style={{ ...p1, backgroundColor: '#e8e8e8', ...mt1 }}>
          <Text numberOfLines={2}>{payload && payload.params[0]}</Text>
        </View>
        <View style={{ ...rowBetween, ...mt2 }}>
          <View style={{ width: '45%' }}>
            <Button title='拒绝' color="warning" onPress={rejectSignture} />
          </View>
          <View style={{ width: '45%' }}>
            <Button title='签名' onPress={() => signture()} />
          </View>
        </View>
      </View>
      {verifyPwdVisible && <VerifyPasswordModal visible={verifyPwdVisible} setVisible={setVerifyPwdVisible} cb={signture} />}
    </BottomSheet>
  )
};

const styles = MyStyleSheet.create({
  approveContainer: {
    height: 400
  }
});
