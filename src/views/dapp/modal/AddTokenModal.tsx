import { View, Text, Dimensions, Image } from "react-native";
import { useEffect, useState } from 'react';
import { BottomSheet, Button } from "@rneui/themed";
import { AddTokenModalType } from "../../../interface";
import MessageKeys from "../../../utils/browser/MessageKeys";
import { globalStyle } from "../../../styles";
import { fromBigNumber, splitAddress, toFixed2 } from "../../../utils/wallet";
import { MyStyleSheet } from "../../../utils/MyStyleSheet";
const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');
const { p2, rowBetween, rowItems, ml1, rowCenter, plr1, mt4, tac, fz20, alignItem, mt1, fz16, mt2, columnBetween, ml5px } = globalStyle;

export const AddToeknModal = ({ event, active_account, active_network }: any) => {

  const [visible, setVisible] = useState(false);
  const [payload, setPayload] = useState<AddTokenModalType | any>(null);

  const rejectAddToken = () => {
    payload.reject();
    setVisible(false);
  };

  const addToken = () => {
    payload.approve();
    setVisible(false);
  };

  useEffect(() => {
    if (!visible) setPayload(null);
  }, [visible])

  useEffect(() => {
    event.on(MessageKeys.openAppTokenModal, (e: AddTokenModalType) => {
      setVisible(true);
      setPayload(e);
    })
  }, []);

  return (
    <BottomSheet isVisible={visible}>
      <View style={{ width: deviceWidth, ...styles.approveContainer, backgroundColor: '#fff', borderTopLeftRadius: 10, borderTopRightRadius: 10, ...p2, ...columnBetween }}>
        <View>
          <Text style={{ ...fz20, color: 'blue', ...tac }}>添加代币</Text>
          <View style={{ width: '100%', height: 1, backgroundColor: 'blue', ...mt1 }} />
          <View style={{ ...mt2, ...rowBetween, ...alignItem }}>
            <View style={rowItems}>
              {
                payload && !payload.options.image
                  ?
                  <Image source={{ uri: payload && payload.options.image }} style={{ width: 30, height: 30 }} resizeMode='cover' />
                  :
                  <View style={{ width: 40, height: 40, backgroundColor: 'blue', borderRadius: 20 }}></View>
              }
              <Text style={{ ...ml1, ...fz16 }}>{payload && payload.name}</Text>
            </View>
            <View style={rowItems}>
              <Text style={{ ...fz16 }}>{payload && toFixed2(fromBigNumber(payload.balance, payload.options.decimals), 4)}</Text>
              <Text style={{ ...fz16, ...ml5px }}>{payload && payload.options.symbol}</Text>
            </View>
          </View>
        </View>
        <View style={rowBetween}>
          <View style={{ width: '48%' }}>
            <Button title='拒绝' color="warning" onPress={rejectAddToken} />
          </View>
          <View style={{ width: '48%' }}>
            <Button title='添加' onPress={addToken} />
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
