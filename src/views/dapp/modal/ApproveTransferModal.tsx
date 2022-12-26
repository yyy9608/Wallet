import { View, Text, Dimensions, Image, ScrollView } from "react-native";
import { useEffect, useMemo, useState } from 'react';
import { BottomSheet, Button } from "@rneui/themed";
import { ApproveTransferModalType } from "../../../interface";
import MessageKeys from "../../../utils/browser/MessageKeys";
import { globalStyle } from "../../../styles";
import { fromBigNumber, splitAddress, toBigNumber, toFixed2, wei } from "../../../utils/wallet";
import { MyStyleSheet } from "../../../utils/MyStyleSheet";
import { BigNumber } from "ethers";
import VerifyPasswordModal from "../../../components/Verify-Password-Modal";
const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');
const { p1, rowBetween, rowItems, ml1, rowCenter, row, mtb1, tac, fz20, alignItem, mt1, fz16, columnBetween, tar } = globalStyle;

export const ApproveTransferModal = ({ event, active_account, active_network }: any) => {

  const [visible, setVisible] = useState(false);
  const [payload, setPayload] = useState<ApproveTransferModalType | any>(null);
  const [verifyPwdVisible, setVerifyPwdVisible] = useState(false);

  const rejectTransfer = () => {
    payload.reject();
    setVisible(false);
  };

  const confirm = (bool?: Boolean) => {
    if (!bool) {
      setVerifyPwdVisible(true);
      return;
    }
    payload.approve();
    setVisible(false);
  };

  useEffect(() => {
    if (!visible) setPayload(null);
  }, [visible])

  useEffect(() => {
    event.on(MessageKeys.openTransferModal, (e: ApproveTransferModalType) => {
      setVisible(true);
      setPayload(e);
    })
  }, []);

  return (
    <BottomSheet isVisible={visible}>
      <View style={{ width: deviceWidth, ...styles.approveContainer, backgroundColor: '#fff', borderTopLeftRadius: 10, borderTopRightRadius: 10, ...p1, ...columnBetween }}>
        <View style={{ height: '10%' }}>
          <Text style={{ ...fz20, color: 'blue', ...tac }}>Send Transaction</Text>
        </View>
        <ScrollView style={{ height: '75%' }}>
          {/* https://cosmictoken.co/favicon.ico */}
          <View style={{ ...rowCenter }}>
            <Image source={{ uri: payload ? payload.pageMetadata.icon : '' }} style={{ width: 80, height: 80 }} />
            {/* <Image source={{ uri: 'https://cosmictoken.co/favicon.ico' }} style={{ width: 80, height: 80 }} /> */}
          </View>
          <View style={rowCenter}>
            <Text numberOfLines={1} ellipsizeMode='middle' style={{ ...mt1, ...fz16 }}>{payload && payload.pageMetadata.origin}</Text>
          </View>
          {
            payload && !payload.inputData.method
            &&
            <View>
              <UnknownWidget payload={payload} active_account={active_account} active_network={active_network} />
            </View>
          }
          {
            payload && payload.inputData.method === 'transfer'
            &&
            <View>
              <TransferWidget payload={payload} active_account={active_account} active_network={active_network} />
            </View>
          }
          {
            payload && payload.inputData.method === 'approve'
            &&
            <View>
              <ApproveWidget payload={payload} active_account={active_account} active_network={active_network} />
            </View>
          }
        </ScrollView>
        <View style={{ height: '15%', ...rowBetween, ...alignItem }}>
          <View style={{ width: '48%' }}>
            <Button title='拒绝' color="warning" onPress={rejectTransfer} />
          </View>
          <View style={{ width: '48%' }}>
            <Button title='确认' onPress={() => confirm()} />
          </View>
        </View>
      </View >
      {verifyPwdVisible && <VerifyPasswordModal visible={verifyPwdVisible} setVisible={setVerifyPwdVisible} cb={confirm} />}
    </BottomSheet >
  )
};

const UnknownWidget = ({ payload, active_account, active_network }: any) => {
  const computedGas = useMemo(() => {
    let gas = payload.result.gasLimit.toNumber() * Number(payload.result.gasPrice);
    return fromBigNumber(toBigNumber(gas.toString(), 21), 30);
  }, [payload.result.gasPrice, payload.result.gasLimit]);

  return (
    <View style={{ ...mt1 }}>
      <View style={{ ...row, ...p1, backgroundColor: '#f5f5f5', }}>
        <Text style={{ width: '40%' }}>账号：{active_account.accountName}</Text>
        <Text style={{ width: '20%', color: 'blue' }}>至</Text>
        <Text style={{ width: '40%' }}>0x{splitAddress(payload.params[0].to, 10)}</Text>
      </View>
      <View style={{ ...mtb1, ...p1, backgroundColor: '#f5f5f5', }}>
        <Text style={{ color: 'blue' }}>未知方法</Text>
        <View style={{ width: '100%', height: 1, backgroundColor: '#e8e8e8', ...mtb1 }}></View>
        <View style={{ ...rowBetween }}>
          <Text>Gas矿工费</Text>
          <Text>{toFixed2(computedGas, 8)} {active_network.symbol}</Text>
        </View>
        <View style={{ width: '100%', height: 1, backgroundColor: '#e8e8e8', ...mtb1 }}></View>
        <View style={{ ...rowBetween }}>
          <Text>InputData</Text>
          <Text style={{ width: '75%', textAlign: 'justify' }}>{payload.params[0].data}</Text>
        </View>
      </View>
    </View>
  )
}

const ApproveWidget = ({ payload, active_account, active_network }: any) => {

  const computedGas = useMemo(() => {
    let gas = payload.result.gasLimit.toNumber() * Number(payload.result.gasPrice);
    return fromBigNumber(toBigNumber(gas.toString(), 21), 30);
  }, [payload.result.gasPrice, payload.result.gasLimit]);

  const isMaxUint = useMemo(() => {
    return payload.inputData.inputs[1].eq(wei.MaxUint256);
  }, [payload.inputData.inputs[1]]);

  return (
    <View style={{ ...mt1 }}>
      <View style={{ ...row, ...p1, backgroundColor: '#f5f5f5', }}>
        <Text style={{ width: '40%' }}>账号：{active_account.accountName}</Text>
        <Text style={{ width: '20%', color: 'blue' }}>授权至</Text>
        <Text style={{ width: '40%' }}>0x{splitAddress(payload.inputData.inputs[0], 10)}</Text>
      </View>
      <View style={{ ...mtb1, ...p1, backgroundColor: '#f5f5f5', }}>
        <View style={{ ...rowBetween }}>
          <Text >授权数量</Text>
          <Text style={{ textAlign: 'justify', width: '75%', ...tar, color: isMaxUint ? 'red' : '' }}>{isMaxUint ? '无限数量' : toFixed2(fromBigNumber(payload.inputData.inputs[1], payload.result.decimals), 6)}<>{payload.result.contractSymbol}</></Text>
        </View>
        <View style={{ width: '100%', height: 1, backgroundColor: '#e8e8e8', ...mtb1 }}></View>
        <View style={{ ...rowBetween }}>
          <Text>Gas矿工费</Text>
          <Text>{toFixed2(computedGas, 8)}{active_network.symbol}</Text>
        </View>
        <View style={{ width: '100%', height: 1, backgroundColor: '#e8e8e8', ...mtb1 }}></View>
        <View style={{ ...rowBetween }}>
          <Text>InputData</Text>
          <Text style={{ width: '75%', textAlign: 'justify' }}>{payload.params[0].data}</Text>
        </View>
      </View>
    </View>
  )
};

const TransferWidget = ({ payload, active_account, active_network }: any) => {

  const computedGas = useMemo(() => {
    let gas = payload.result.gasLimit.toNumber() * Number(payload.result.gasPrice);
    return fromBigNumber(toBigNumber(gas.toString(), 21), 30);
  }, [payload.result.gasPrice, payload.result.gasLimit]);

  return (
    <View style={{ ...mt1 }}>
      <View style={{ ...row, ...p1, backgroundColor: '#f5f5f5', }}>
        <Text style={{ width: '40%' }}>账号：{active_account.accountName}</Text>
        <Text style={{ width: '20%', color: 'blue' }}>转账至</Text>
        <Text style={{ width: '40%' }}>0x{splitAddress(payload.inputData.inputs[0], 10)}</Text>
      </View>
      <View style={{ ...mtb1, ...p1, backgroundColor: '#f5f5f5', }}>
        <View style={{ ...rowBetween }}>
          <Text>转账金额</Text>
          <Text>{toFixed2(fromBigNumber(payload.inputData.inputs[1], payload.result.decimals), 6)} {payload.result.contractSymbol}</Text>
        </View>
        <View style={{ width: '100%', height: 1, backgroundColor: '#e8e8e8', ...mtb1 }}></View>
        <View style={{ ...rowBetween }}>
          <Text>Gas矿工费</Text>
          <Text>{toFixed2(computedGas, 8)} {active_network.symbol}</Text>
        </View>
        <View style={{ width: '100%', height: 1, backgroundColor: '#e8e8e8', ...mtb1 }}></View>
        <View style={{ ...rowBetween }}>
          <Text>InputData</Text>
          <Text style={{ width: '75%', textAlign: 'justify' }}>{payload.params[0].data}</Text>
        </View>
      </View>
    </View>
  )
};

const styles = MyStyleSheet.create({
  approveContainer: {
    height: 400
  }
});
