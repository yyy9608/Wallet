import { ethers, logger } from "ethers";
import { useEffect, useState } from "react";
import { Text, View, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from "react-native"
import { connect } from "react-redux";
import { SwapTransactionLogType } from "../../interface";
import { globalStyle } from "../../styles";
import { _abi as UniswapV2RouterABI } from "../../contract/IUniswapV2Router02__factory";
import InputDataDecoder from "../../utils/decoder";
import { splitAddress } from "../../utils/wallet";
import { getTime } from "../../utils";
const { height: deviceHeight } = Dimensions.get('window');
const { p1, rowBetween, mt1, tac, mt2, fz18, fw550, mb1, column, mb3 } = globalStyle;

const SwapExchangeLog = ({ swap_log, active_network, navigation }: any) => {

  const [exchangeInfo, setExchangeInfo] = useState([] as any);
  const [refreshing, setRefreshing] = useState(false);

  const getExchangeInfo = async () => {
    setRefreshing(true);
    setExchangeInfo([]);
    let provider = new ethers.providers.JsonRpcProvider(active_network.rpc);
    let rqsList: any = [];
    swap_log.forEach((item: SwapTransactionLogType) => {
      rqsList.push(provider.getTransaction(item.hash));
    });
    if (rqsList.length <= 0) return;
    let res = await Promise.all(rqsList);
    let decode = new InputDataDecoder(UniswapV2RouterABI);
    res.forEach((item: any) => {
      item.data = decode.decodeData(item.data)
    });
    setRefreshing(false);
    setExchangeInfo(res);
  };

  const onRefresh = () => {
    getExchangeInfo();
  };

  useEffect(() => {
    getExchangeInfo();
  }, []);

  return (
    <SafeAreaView>
      <StatusBar />
      <ScrollView
        style={{
          ...p1,
          height: '100%',
          ...column
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {
          exchangeInfo.map((item: any, index: number) => {
            return (
              <View style={{ width: '100%', ...p1, backgroundColor: '#479AC7', borderRadius: 10, ...mb1 }} key={index}>
                <View style={{ ...rowBetween }}>
                  <Text style={{ color: '#fff' }}>0x{splitAddress(item.data.inputs[2][0], 6)}</Text>
                  <Text style={{ color: '#fff' }}>兑换</Text>
                  <Text style={{ color: '#fff' }}>0x{splitAddress(item.data.inputs[2][1], 6)}</Text>
                </View>
                <Text style={{ color: '#fff', ...mt1 }}>交易hash:{splitAddress(item.hash, 10)}</Text>
                <Text style={{ color: '#fff', ...mt1 }}>兑换至地址: 0x{splitAddress(item.data.inputs[3], 10)}</Text>
                <Text style={{ color: '#fff', ...mt1 }}>兑换时间: {getTime(item.data.inputs[4].toNumber() * 1000)}</Text>
                <TouchableOpacity style={{ borderBottomColor: '#f58220', borderBottomWidth: 2, }} onPress={() => navigation.navigate('ChainBrowser', { hash: item.hash })}>
                  <Text style={{ color: '#f58220', ...mt2, ...tac, ...fw550, ...fz18 }}>打开区块链浏览器</Text>
                </TouchableOpacity>
              </View>
            )
          })
        }
        <View style={mb3}></View>
      </ScrollView>
    </SafeAreaView>
  )
};

const filterSwapLog = (state: any) => {
  let log = JSON.parse(state.swapLogReducer);
  let active_account = JSON.parse(state.activeAccount);
  let active_network = JSON.parse(state.activeNetwork);
  let newLog: Array<SwapTransactionLogType> = [];
  log.forEach((item: SwapTransactionLogType) => {
    if (item.wallet_address === active_account.address && item.chainId === active_network.chainID) {
      newLog.push(item)
    }
  });
  return newLog;
};

const mapStateToProps = (state: any) => {
  return {
    swap_log: filterSwapLog(state),
    active_network: JSON.parse(state.activeNetwork)
  }
};

export default connect(mapStateToProps)(SwapExchangeLog);