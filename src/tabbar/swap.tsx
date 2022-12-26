import { BottomSheet, Button } from "@rneui/themed";
import { useEffect, useState } from "react";
import { Text, View, SafeAreaView, ScrollView, StatusBar, TextInput, TouchableOpacity, Dimensions, ActivityIndicator, ToastAndroid as Toast } from "react-native";
import { globalStyle } from "../styles";
import swapTokenList from '../config/swap-token.json';
import { TabActions } from "@react-navigation/native";
import { connect } from "react-redux";
import { ethers, Wallet } from "ethers";
import { _abi } from "../contract/abi";
import { Contract, Provider } from "ethers-multicall";
import { fromBigNumber, toBigNumber, toFixed2, wei } from "../utils/wallet";
import { IUniswapV2Router02__factory } from "../contract/IUniswapV2Router02__factory";
import { SwapTransactionLogType, TransactionRequest } from '../interface';
import VerifyPasswordModal from "../components/Verify-Password-Modal";
import { addSwapLog } from "../redux/action/swapLogAction";
const { fz18, fw550, p1, mt1, fz12, rowBetween, rowItems, alignItems, rowCenter, fz24, mt5, tac, mt2, columnBetween, fz20, p2, mt3, column } = globalStyle;
const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

const Swap = ({ active_account, active_network, navigation, add_swap_log }: any) => {

  let [tokenVisible, setTokenVisible] = useState(false);
  let [confirmVisible, setConfirmVisible] = useState(false);
  let [tradingPair, setTradingPair] = useState([] as any);
  let [currentKey, setCurretKey] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(wei.Zero);
  const [buttonLoading, setButtonType] = useState(false);
  const [transaction, setTransaction] = useState({} as any);
  const [loading, setLoading] = useState(true);
  const [disabledButton, setDisabledButton] = useState(false);
  const [flexDirection, setFlexDirection] = useState('column');
  let provider = new ethers.providers.JsonRpcProvider(active_network.rpc);
  let wallet = new Wallet(active_account.privateKey, provider);
  let _contract = IUniswapV2Router02__factory.connect("0xd99d1c33f9fc3444f8101754abc46c52416550d1", wallet);

  // 选择Token  
  const checkToken = (item: any) => {
    setTokenVisible(false);
    tradingPair[currentKey] = item;
    setTradingPair([...tradingPair]);
  };

  // 翻转交易对
  const reverseTradingPair = () => {
    if (tradingPair.length < 2) return;
    tradingPair = tradingPair.reverse();
    setTradingPair([...tradingPair]);
    // if (flexDirection === 'column') {
    //   setFlexDirection('column-reverse')
    // } else {
    //   setFlexDirection('column');
    // }
  };

  // 获取汇率
  const getRate = async () => {
    let res = await _contract.getAmountsOut(toBigNumber('1', tradingPair[0].decimals), [tradingPair[0].address, tradingPair[1].address]);
    let rate = toBigNumber(toFixed2(fromBigNumber(res[1], res[0].toString().length - 1), 4), 4)
    setExchangeRate(rate);
  };

  // rate decimals 4 + token decimals
  const handleValue = (idx: number) => {
    try {
      if (tradingPair[idx] && tradingPair[idx].value && ethers.BigNumber.isBigNumber(tradingPair[idx].value)) {
        let value = fromBigNumber(tradingPair[idx].value, tradingPair[idx].decimals);
        // if (value.indexOf('.') > -1 && value.substring(value.indexOf('.') + 1, value.length) == '0' && value.indexOf('.') !== value.length) {
        //   value = value.substring(0, value.indexOf('.'));
        // }
        return value;
      }
      return '';
    } catch (error) {
      return '';
    }
  };

  const setInputValue = (val: string, idx: number) => {
    try {
      if (tradingPair.length < 2 && buttonLoading) return;
      if (Number.isNaN(Number(val))) return;
      tradingPair[idx].value = toBigNumber(val, tradingPair[idx].decimals);

      if (idx === 0) {
        tradingPair[1].value = toBigNumber(toFixed2(fromBigNumber(toBigNumber(val, tradingPair[idx].decimals).mul(exchangeRate), tradingPair[idx].decimals + 4), 18), tradingPair[idx].decimals);
      } else {
        tradingPair[0].value = toBigNumber(toFixed2(fromBigNumber(toBigNumber(val, tradingPair[idx].decimals).div(exchangeRate), tradingPair[idx].decimals - 4), 18), tradingPair[idx].decimals);
      };
      if (tradingPair[0].value.gt(tradingPair[0].balance)) {
        setDisabledButton(true);
      } else {
        setDisabledButton(false);
      }
      setTradingPair([...tradingPair]);
    } catch (error) {

    }
  };

  const confirmExchange = async () => {
    if (tradingPair.length < 2) return;
    try {
      setButtonType(true);
      let params: any = {
        amountIn: tradingPair[0].value,
        amountOutMin: '0',
        path: [tradingPair[0].address, tradingPair[1].address],
        to: active_account.address,
        deadline: parseInt((Date.now() / 1000).toString())
      };

      let gasPriceRqs = provider.getGasPrice();
      let nonceRqs = provider.getTransactionCount(active_account.address);
      let gasLimitRqs = _contract.estimateGas.swapExactTokensForTokensSupportingFeeOnTransferTokens(
        params.amountIn,
        params.amountOutMin,
        params.path,
        params.to,
        params.deadline
      );
      let [gasPrice, gasLimit, nonce] = await Promise.all([gasPriceRqs, gasLimitRqs, nonceRqs]);
      params.gasPrice = gasPrice;
      params.gasLimit = gasLimit;
      params.nonce = nonce;
      setButtonType(false);
      setConfirmVisible(true);
      setTransaction(params);
    } catch (error) {
      setButtonType(false);
    }
  };

  useEffect(() => {
    if (tradingPair.length >= 2) {
      getRate();
    };
  }, [tradingPair]);

  return (
    <SafeAreaView>
      <StatusBar />
      <ScrollView style={p1}>
        <View>
          <View style={{ ...rowBetween }}>
            <Text style={{ ...fz18, ...fw550 }}>兑换</Text>
            <Text onPress={() => navigation.navigate('SwapExchangeLog')} style={{ color: 'blue' }}>兑换记录</Text>
          </View>
          <Text style={mt1}>即时交易</Text>
        </View>
        <View style={{ ...column, flexDirection: flexDirection }}>
          <View style={{ width: '100%', borderColor: 'blue', borderWidth: 1, ...mt1, ...p1, borderRadius: 10, ...mt1, }}>
            <Text style={{ ...fz12 }}>余额：{tradingPair[0] ? toFixed2(fromBigNumber(tradingPair[0].balance, tradingPair[0].decimals), 6) : 0}</Text>
            <View style={{ ...rowBetween, ...alignItems }}>
              <TextInput placeholder="请输入数量" value={handleValue(0)} onChangeText={e => setInputValue(e, 0)} keyboardType='numeric' />
              <TouchableOpacity style={rowItems} onPress={() => {
                setCurretKey(0);
                setTokenVisible(true);
              }}>
                <Text>{tradingPair[0] ? tradingPair[0].name : '选择'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ ...rowCenter, ...mt1 }}>
            <TouchableOpacity style={{ width: 40, height: 40, backgroundColor: '#e8e8e8', ...rowCenter, borderRadius: 20 }} onPress={reverseTradingPair}>
              <Text style={{ color: 'blue', ...fz24 }}>⬇</Text>
            </TouchableOpacity>
          </View>
          <View style={{ width: '100%', borderColor: 'blue', borderWidth: 1, ...mt1, ...p1, borderRadius: 10, ...mt1, }}>
            <Text style={{ ...fz12 }}>余额：{tradingPair[1] ? toFixed2(fromBigNumber(tradingPair[1].balance, tradingPair[1].decimals), 6) : 0}</Text>
            <View style={{ ...rowBetween, ...alignItems }}>
              <TextInput placeholder="请输入数量" value={handleValue(1)} onChangeText={e => setInputValue(e, 1)} keyboardType='numeric' />
              <TouchableOpacity style={rowItems} onPress={() => {
                setCurretKey(1);
                setTokenVisible(true);
              }}>
                <Text>{tradingPair[1] ? tradingPair[1].name : '选择'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={mt5}>
          <Button title="兑换" color="warning" disabled={disabledButton} onPress={confirmExchange} loading={buttonLoading} />
        </View>
      </ScrollView>
      {/* 选择代币 */}
      <BottomSheet isVisible={tokenVisible} onBackdropPress={() => setTokenVisible(false)}>
        <TokenList
          active_account={active_account}
          active_network={active_network}
          cb={checkToken}
          visible={tokenVisible}
          loading={loading}
          setLoading={setLoading} />
      </BottomSheet>
      {/* 确认兑换 */}
      <BottomSheet isVisible={confirmVisible} onBackdropPress={() => setConfirmVisible(false)}>
        <ConfirmExchange
          tokenList={tradingPair}
          transaction={transaction}
          active_network={active_network}
          setVisible={setConfirmVisible}
          add_swap_log={add_swap_log}
          active_account={active_account}
          _contract={_contract}
          wallet={wallet}
          provider={provider}
          navigation={navigation} />
      </BottomSheet>
    </SafeAreaView>

  )
};

const ConfirmExchange = ({ tokenList, transaction, active_network, setVisible, _contract, wallet, provider, navigation, active_account, add_swap_log }: any) => {

  const [verifyPwdVisible, setVerifyPwdVisible] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [hash, setHash] = useState('');

  const exchange = async (bool?: Boolean) => {

    if (!bool) {
      setVerifyPwdVisible(true);
      return;
    };
    // swapExactTokensForTokens
    // swapExactTokensForTokensSupportingFeeOnTransferTokens
    let data = {};
    let params = {
      gasPrice: transaction.gasPrice,
      gasLimit: transaction.gasLimit,
      nonce: transaction.nonce,
    } as TransactionRequest;
    let signData = null;
    let tx = null;
    setButtonLoading(true);
    try {
      data = await _contract.populateTransaction.swapExactTokensForTokens(
        transaction.amountIn,
        transaction.amountOutMin,
        transaction.path,
        transaction.to,
        transaction.deadline + 30
      );
      params = { ...data, ...params };
      signData = await wallet.signTransaction(params);
      tx = await provider.sendTransaction(signData);
      add_swap_log({
        hash: tx.hash,
        wallet_address: active_account.address,
        chainId: active_network.chainID
      })
      setButtonLoading(false);
      setHash(tx.hash);
      let { status } = await tx.wait();
      if (status === 1) {
        Toast.show('交易完成', 2000);
      } else {
        Toast.show('交易失败', 2000);
      }
    } catch (error) {
      try {
        data = await _contract.populateTransaction.swapExactTokensForTokensSupportingFeeOnTransferTokens(
          transaction.amountIn,
          transaction.amountOutMin,
          transaction.path,
          transaction.to,
          transaction.deadline + 30
        );
        params = { ...data, ...params };
        signData = await wallet.signTransaction(params);
        tx = await provider.sendTransaction(signData);
        add_swap_log({
          hash: tx.hash,
          wallet_address: active_account.address,
          chainId: active_network.chainID
        })
        setHash(tx.hash);
        setButtonLoading(false);
        let { status } = await tx.wait();
        if (status === 1) {
          Toast.show('交易完成', 2000);
        } else {
          Toast.show('交易失败', 2000);
        }
      } catch (error) {
        Toast.show('交易发送失败', 2000);
        setButtonLoading(false);
      }
    }
  };

  return (
    <View style={{ height: deviceHeight / 1.7, backgroundColor: "#f5f5f5", borderTopLeftRadius: 10, borderTopRightRadius: 10, ...columnBetween }}>
      <View>
        <Text style={{ ...TabActions, ...fz18, ...fw550, ...tac, ...mt1 }}>确认兑换</Text>
        <View style={{ width: '100%', height: 1, backgroundColor: '#e8e8e8', ...mt1 }}></View>
      </View>
      {
        hash
          ?
          <View style={rowCenter}>
            <View>
              <Text style={{ ...fz24, color: '#1fc7d4', ...tac }}>⬆</Text>
              <Text style={{ ...mt1, ...fz18, ...tac }}>已提交交易</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ChainBrowser', { hash: hash })}>
                <Text style={{ ...fz18, ...fw550, color: '#1fc7d4', ...tac, ...mt1, borderBottomColor: '#1fc7d4', borderBottomWidth: 2 }}>在区块链浏览器查看</Text>
              </TouchableOpacity>
            </View>
          </View>
          :
          <ScrollView style={p1}>
            <View style={{ ...rowBetween }}>
              <Text style={{ ...fz20 }}>{toFixed2(fromBigNumber(tokenList[0].value, tokenList[0].decimals), 5)}</Text>
              <Text style={{ ...fz20 }}>{tokenList[0].name}</Text>
            </View>
            <Text style={{ ...fz24, ...tac }}>⬇</Text>
            <View style={{ ...rowBetween }}>
              <Text style={{ ...fz20 }}>{toFixed2(fromBigNumber(tokenList[1].value, tokenList[1].decimals), 5)}</Text>
              <Text style={{ ...fz20 }}>{tokenList[1].name}</Text>
            </View>
            <View style={{ ...rowBetween, ...mt1 }}>
              <Text style={{ color: 'blue', ...fz20 }}>滑点</Text>
              <Text style={{ color: 'blue', ...fz20 }}>0.5%</Text>
            </View>
            <View style={{ ...mt2, backgroundColor: '#e8e8e8', ...p2 }}>
              <View style={{ ...rowBetween }}>
                <Text>价格</Text>
                <Text>{toFixed2(fromBigNumber(tokenList[1].value, tokenList[1].decimals), 5)} {tokenList[1].name}/{tokenList[0].name}</Text>
              </View>
              <View style={{ ...rowBetween, ...mt1 }}>
                <Text>矿工费用(gasPrice)</Text>
                <Text>{transaction.gasPrice && toFixed2(fromBigNumber(transaction.gasPrice.mul(transaction.gasLimit), 18), 5)} {active_network.symbol}</Text>
              </View>
            </View>
          </ScrollView>
      }
      {
        hash
          ?
          <Button title="关闭" color="warning" onPress={() => setVisible(false)} />
          :
          <Button title="确认兑换" color="warning" onPress={() => exchange()} loading={buttonLoading} />
      }
      {verifyPwdVisible && <VerifyPasswordModal visible={verifyPwdVisible} setVisible={setVerifyPwdVisible} cb={exchange} />}
    </View >
  )
};

const TokenList = ({ active_account, active_network, cb, visible, loading, setLoading }: any) => {

  const [tokenList, setTokenList] = useState(swapTokenList as any);

  const getTokenBalance = async () => {
    try {
      let provider = new ethers.providers.JsonRpcProvider(active_network.rpc);
      let rqsList: any = [];
      let _provider = new Provider(provider, active_network.chainID);
      tokenList.forEach((item: any) => {
        let _contract = new Contract(item.address, _abi);
        rqsList.push(_contract.balanceOf(active_account.address));
      });
      if (rqsList.length <= 0) {
        setLoading(false);
        return;
      };
      let res = await _provider.all(rqsList);
      res.forEach((item: any, index: number) => {
        tokenList[index].balance = item;
      });
      setLoading(false);
      setTokenList([...tokenList]);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTokenBalance();
  }, []);

  return (
    <View style={{ height: deviceHeight / 1.7, backgroundColor: "#f5f5f5", borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
      <Text style={{ ...TabActions, ...fz18, ...fw550, ...tac, ...mt1 }}>代币选择</Text>
      <View style={{ width: '100%', height: 1, backgroundColor: '#e8e8e8', ...mt1 }}></View>
      {
        visible
        &&
        <ScrollView>
          <View>
            {
              loading
                ?
                <View style={{ height: deviceHeight / 1.7, ...rowCenter }}>
                  <ActivityIndicator size="large" color="#0000ff" />
                </View>
                :
                <View style={p1}>
                  {
                    swapTokenList.map((item: any, index: number) => {
                      return (
                        <TouchableOpacity key={index} style={{ ...rowBetween, ...mt2 }} onPress={() => {
                          cb(item);
                        }}>
                          <Text>{item.name}</Text>
                          <Text>{item.balance ? toFixed2(fromBigNumber(item.balance, item.decimals), 6) : 0}</Text>
                        </TouchableOpacity>
                      )
                    })
                  }
                </View>
            }

          </View>
        </ScrollView >
      }
    </View>
  )
};

const mapStateToProps = (state: any) => {
  return {
    active_account: JSON.parse(state.activeAccount),
    active_network: JSON.parse(state.activeNetwork)
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    add_swap_log: (item: SwapTransactionLogType) => addSwapLog(dispatch, item)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Swap);