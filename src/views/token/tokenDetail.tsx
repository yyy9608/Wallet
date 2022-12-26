import { connect } from "react-redux";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { globalStyle } from "../../styles";
import { Button } from "@rneui/themed";
import React, { useState, useEffect } from 'react';
import { fromBigNumber, splitAddress, toFixed2, wei } from "../../utils/wallet";
import { TransferLogType } from "../../interface";
import { ethers } from "ethers";
import { getTime } from "../../utils";
import InputDataDecoder from "../../utils/decoder";
import { MyStyleSheet } from "../../utils/MyStyleSheet";
const { p1, plr1, rowBetween, rowItems, ml1, fz16, mtb1, alignItems, column, rowEvenly, mt5px, mt1, rowCenter, mt2, fz12, tar } = globalStyle;

const TokenDetail = ({ route, navigation, transfer_log, active_account, active_network }: any) => {

  const [transferLog, setTransferLog] = useState([]);
  const [loading, setLoading] = useState(false);

  const getTransferLog = async () => {
    let hashList: Array<TransferLogType> = [];
    let func: any = [];
    let transferList: any = [];
    let provider = new ethers.providers.JsonRpcProvider(active_network.rpc);
    // provider.getTransactionReceipt
    transfer_log.forEach((item: TransferLogType) => {
      if (item.contractAddress === route.params.contractAddress && item.walletAddress === active_account.address && item.rpc === active_network.rpc) {
        hashList.push(item);
        func.push(provider.getTransaction(item.hash));
      }
    });
    if (func.length <= 0) return;
    setLoading(true);
    let res = await Promise.all(func);

    res.forEach((item: any, index: number) => {
      transferList.push({
        ...item,
        isStatus: hashList[index].isStatus,
        createTime: hashList[index].createTime ? hashList[index].createTime : new Date().getTime(),
        decimals: item.decimals ? item.decimals : 18,
        symbol: route.params.symbol
      })
    });
    setLoading(false);
    setTransferLog(transferList);
  };

  const isMainToken = (item: any) => {
    if (item.value.gt('0')) {
      return '-' + toFixed2(fromBigNumber(item.value, item.decimals), 5);
    };
    let decoder = new InputDataDecoder();
    let inputData = decoder.decodeData(item.data);

    if (inputData && inputData.inputs.length >= 2) {
      if (inputData.inputs[1].eq(wei.MaxUint256)) {
        return '无限数量'
      }
      return '-' + toFixed2(fromBigNumber(inputData.inputs[1], item.decimals), 5)
    };
    return '-0';
  };

  const isApprove = (item: any) => {
    let decoder = new InputDataDecoder();
    let inputData: any = decoder.decodeData(item.data);
    return inputData.method;
  };

  useEffect(() => {
    getTransferLog();
  }, [transfer_log]);

  return (
    <View style={column}>
      <View style={{ height: '90%' }}>
        <View style={{ ...p1, backgroundColor: '#fff', borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
          <View style={{ ...rowItems }}>
            <View style={{ width: 40, height: 40, backgroundColor: '#009ad6', borderRadius: 25 }}></View>
            <View style={{ ...ml1 }}>
              <Text style={{ color: '#000', ...fz16, }}>{route.params.symbol}</Text>
              {
                route.params.contractAddress && <Text style={mt5px}>{splitAddress(route.params.contractAddress)}</Text>
              }
            </View>
          </View>
          <View style={{ backgroundColor: '#e8e8e8', ...mtb1, width: '100%', height: 1 }}></View>
          <View style={{ ...rowBetween, ...alignItems }}>
            <Text style={{ color: '#000' }}>资产余额</Text>
            <View>
              <Text>{toFixed2(fromBigNumber(route.params.balance, route.params.decimals), 4)}</Text>
            </View>
          </View>
        </View>
        <ScrollView style={{ ...mt1, backgroundColor: '#ffffff', ...plr1, borderRadius: 10 }}>
          {
            loading
              ?
              <View style={{ ...rowCenter, height: 200 }}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
              :
              transferLog.map((item: any, index: number) => {
                return (
                  <TouchableOpacity key={index} onPress={() => navigation.navigate('TransferDetail', item)}>
                    <View style={{ ...alignItems, ...rowBetween, ...mt2 }}>
                      <View style={{ ...rowItems }}>
                        <View style={{ width: 40, height: 40, backgroundColor: '#009ad6', borderRadius: 20, ...rowCenter }}>
                          {isApprove(item) === 'approve' && <Text style={{ color: '#f3704b' }}>授权</Text>}
                        </View>
                        <View style={ml1}>
                          <Text style={{ color: '#000' }}>{splitAddress(item.from)}</Text>
                          <Text style={{ ...mt5px, ...fz12 }}>{getTime(item.createTime)}</Text>
                        </View>
                      </View>
                      <View>
                        <Text style={{ color: item.isStatus === 2 ? 'red' : '#009ad6', ...tar }}>{item.isStatus === 0 ? '确认中' : item.isStatus === 1 ? '完成' : '失败'}</Text>
                        <Text style={{ color: '#009ad6', ...mt5px, ...tar }}>{isMainToken(item)}</Text>
                      </View>
                    </View>
                    <View style={{ ...mt2, width: '100%', backgroundColor: '#e8e8e8', height: 1 }}></View>
                  </TouchableOpacity>
                )
              })
          }
          <View style={mt1}></View>
        </ScrollView>
      </View>
      <View style={{ height: '10%', ...rowEvenly, ...alignItems }}>
        <View style={{ width: '40%' }}>
          <Button onPress={() => navigation.navigate('Transfer', route.params.contractAddress)}>转账</Button>
        </View>
        <View style={{ width: '40%' }}>
          <Button color="success" onPress={() => navigation.navigate('CollecMmoney')}>收款</Button>
        </View>
      </View>
    </View >
  )
};

const styles = MyStyleSheet.create({
  arrow: {
    marginLeft: 5,
    marginTop: 1,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: 6,
    borderTopColor: '#fff',//下箭头颜色
    borderLeftColor: '#f76260',//右箭头颜色
    borderBottomColor: '#fff',//上箭头颜色
    borderRightColor: '#fff'//左箭头颜色
  }
});

const mapStateToProps = (state: any) => {
  return {
    token_list: JSON.parse(state.tokenList),
    transfer_log: JSON.parse(state.transferLogReducer),
    active_account: JSON.parse(state.activeAccount),
    active_network: JSON.parse(state.activeNetwork),
  }
};

export default connect(mapStateToProps)(TokenDetail);