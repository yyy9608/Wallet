import { Text, TextInput, View, ScrollView, TouchableOpacity, Dimensions, DeviceEventEmitter, Modal } from "react-native";
import { globalStyle } from "../../styles";
import { useState, useEffect } from 'react';
import { BigNumber, Contract, ethers } from "ethers";
import { connect } from "react-redux";
import { BottomSheet, Button } from "@rneui/themed";
import { fromBigNumber, toBigNumber, toFixed2, wei } from "../../utils/wallet";
import { TransactionRequest } from "../../interface";
import { _abi } from "../../contract/abi";
import { eventName } from "../../config/eventName";
import Toast from "react-native-root-toast";
import { IERC20__factory } from "../../contract/IERC20__factory";
import { QRCodeScreen } from "../../components/QRCode";
import VerifyPasswordModal from "../../components/Verify-Password-Modal";
const { plr1, mt1, mt5px, p1, rowBetween, rowItems, ml1, alignItems, fz10, mt3, tac, rowCenter, fz16, fz14, mt2, row, mtb1, mtb2, ml5px } = globalStyle;

// 0xcd3B766CCDd6AE721141F452C550Ca635964ce71

const Transfer = ({ active_network, tokenList, route, navigation, active_account }: any) => {

  const { width: deviceWidth, height: deviceHeight } = Dimensions.get("window");
  const [qrVisible, setQRVisible] = useState(false);
  const [inputVisible, setInputVisible] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [gasList, setGasList] = useState([
    { title: "慢", gasPrice: '5', gasLimit: '21000' },
    { title: "推荐", gasPrice: '5.5', gasLimit: '21000' },
    { title: "快", gasPrice: '6', gasLimit: '21000' },
  ]);
  const [tokenAddress, setTokenAddress] = useState(route.params);
  const [amount, setAmount] = useState('');
  const [activeGas, setActiveGas] = useState({ title: "推荐", gasPrice: '5.5', gasLimit: '21000' } as any);
  const [gasIndex, setGasIndex] = useState(1);
  const [hintVisible, setHintVisible] = useState(false);
  const [transferVisible, setTransferVisible] = useState(false);
  const [checkTokenVisible, setCheckTokenVisible] = useState(false);
  const [transferParams, setTransferParams] = useState({} as TransactionRequest);
  const [activeToken, setActiveToken] = useState({
    contractAddress: '',
    decimals: 18,
    symbol: active_network.symbol,
  });
  const [verifyPwdVisible, setVerifyPwdVisible] = useState(false);

  const scannerCallback = (value: string) => {
    setQRVisible(false);
    if (ethers.utils.isAddress(value)) {
      setAddress(value);
      setInputVisible(true);
      console.log(value);
    } else {
      Toast.show('无效地址');
    }
  };

  const getParams = async () => {
    console.log(1);

    let provider = new ethers.providers.JsonRpcProvider(active_network.rpc);
    let _balance = null;
    if (tokenAddress) { //if Token 
      let _contract = new Contract(tokenAddress, _abi, provider);
      _balance = _contract.balanceOf(active_account.address);
      let index = tokenList.findIndex((item: any) => item.contractAddress === tokenAddress);
      activeToken.contractAddress = tokenList[index].contractAddress;
      activeToken.decimals = tokenList[index].decimals;
      activeToken.symbol = tokenList[index].symbol;
    } else { //if Main
      _balance = provider.getBalance(active_account.address);
    };
    let _gasPrice = provider.getGasPrice();
    let res = await Promise.all([_balance, _gasPrice]);
    setBalance(toFixed2(fromBigNumber(res[0], activeToken.decimals), 4));
    gasList[0].gasPrice = fromBigNumber(res[1], 9);
    gasList[1].gasPrice = (Number(fromBigNumber(res[1], 9)) + 0.5).toString();
    gasList[2].gasPrice = (Number(fromBigNumber(res[1], 9)) + 1).toString();
    setActiveGas(gasList[1]);
    setGasIndex(1);
    setGasList([...gasList]);
    setActiveToken({ ...activeToken });
  };

  const openTransferVisible = async () => {
    try {
      setHintVisible(false);
      let provider = new ethers.providers.JsonRpcProvider(active_network.rpc);
      let transferParams: TransactionRequest = {
        from: active_account.address,
        to: address,
        gasLimit: BigNumber.from(activeGas.gasLimit),
        gasPrice: toBigNumber(activeGas.gasPrice, 9),
        value: toBigNumber(amount, activeToken.decimals)
      };
      transferParams.nonce = await provider.getTransactionCount(active_account.address);
      setTransferParams(transferParams);
      setTransferVisible(true);
    } catch (error) {
      console.error(error);
    }
  };

  const checkToken = (item: any) => {
    setActiveToken(item);
    setTokenAddress(item.contractAddress);
    setCheckTokenVisible(false);
  };

  const confirmOrder = (bool?: Boolean) => {
    if (!bool) {
      setVerifyPwdVisible(true);
      return;
    };
    let params = {
      from: 'transfer',
      to: 'routes',
      method: 'transfer',
      data: transferParams,
      contractAddress: activeToken.contractAddress,
      decimals: activeToken.decimals
    };
    DeviceEventEmitter.emit(eventName.TRANSFER, params);
    navigation.navigate('Home');
  };

  // 获取 gas费
  const getGasLimit = async () => {
    if (!amount || !ethers.utils.isAddress(address)) return;
    try {
      if (activeToken.contractAddress) {
        let provider = new ethers.providers.JsonRpcProvider(active_network.rpc);
        let wallet = new ethers.Wallet(active_account.privateKey, provider);
        let _contract = IERC20__factory.connect(activeToken.contractAddress, wallet);
        let gas = await _contract.estimateGas.transfer(address, toBigNumber(amount, activeToken.decimals));
        activeGas.gasLimit = gas.toString();
        gasList[0].gasLimit = gas.toString();
        gasList[1].gasLimit = gas.toString();
        gasList[2].gasLimit = gas.toString();
        setActiveGas({ ...activeGas });
        setGasList([...gasList]);
      } else {
        activeGas.gasLimit = '21000';
        gasList[0].gasLimit = '21000';
        gasList[1].gasLimit = '21000';
        gasList[2].gasLimit = '21000';
        setActiveGas({ ...activeGas });
        setGasList([...gasList]);
      };
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getParams();
    getGasLimit();
  }, [tokenAddress, amount]);

  return (
    <ScrollView style={{ ...mt1, ...plr1 }}>
      <Text>转账至</Text>
      {
        !inputVisible &&
        <View style={{ ...rowBetween, ...alignItems, ...mt5px }}>
          <TextInput
            value={address}
            onChangeText={e => {
              setAddress(e);
              setInputVisible(ethers.utils.isAddress(e))
            }}
            style={{ backgroundColor: '#fff', width: '90%' }}
            placeholder="请输入转账地址" />
          <Text style={{ color: 'blue' }} onPress={() => setQRVisible(true)}>扫码</Text>
        </View>
      }
      {
        inputVisible
        &&
        <View style={mt5px}>
          <View style={{ width: '100%', ...p1, borderWidth: 1, borderColor: 'blue', ...rowBetween, ...alignItems }}>
            <View style={{ ...rowItems }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'blue' }}></View>
              <Text style={{ width: '85%', ...ml1 }}>{address}</Text>
            </View>
            <View>
              <Text onPress={() => {
                setAddress('');
                setInputVisible(false);
              }}>X</Text>
            </View>
          </View>
          <View style={{ ...mt1, backgroundColor: '#fff', ...p1 }}>
            <View style={{ ...rowBetween }}>
              <Text>转账金额</Text>
              <Text onPress={() => setCheckTokenVisible(true)}>{activeToken.symbol} {'>'}</Text>
            </View>
            <View style={{ ...rowBetween, borderBottomColor: '#c3c3c3', ...alignItems, borderBottomWidth: 1 }}>
              <TextInput placeholder="请输入转账数量" value={amount} onChangeText={e => setAmount(e)} />
              <Text style={{ ...fz10, borderColor: '#c3c3c3', borderWidth: 1, borderRadius: 10, ...plr1 }}>全部</Text>
            </View>
            <View style={{ ...mt1, ...rowBetween }}>
              <Text>钱包余额</Text>
              <Text>{balance} {activeToken.symbol}</Text>
            </View>
          </View>
          <View style={{ ...mt1, backgroundColor: '#fff', ...p1 }}>
            <Text>矿工费用</Text>
            <View style={{ ...mt1, ...rowBetween }}>
              {
                gasList.map((item: any, index: number) => {
                  return (
                    <TouchableOpacity style={{ width: '23%', }} key={index} onPress={() => {
                      setGasIndex(index);
                      setActiveGas(item);
                    }}>
                      <View style={{ width: '100%', height: 100, borderColor: index === gasIndex ? 'blue' : '#e8e8e8', borderRadius: 10, borderWidth: 1 }} >
                        <Text style={{ ...tac, ...mt1, color: '#000' }}>{item.title}</Text>
                        <Text style={{ ...tac, ...mt1, ...fz10 }}>{toFixed2(fromBigNumber(toBigNumber((Number(item.gasPrice) * Number(item.gasLimit)).toString(), 9), 18), 6)} {active_network.symbol}</Text>
                        <View style={{ width: '100%', height: 1, backgroundColor: '#e8e8e8', ...mt1 }}></View>
                        <Text style={{ ...mt5px, ...tac, ...fz10 }}>≈ 3秒</Text>
                      </View>
                    </TouchableOpacity>
                  )
                })
              }
              <TouchableOpacity style={{ width: '23%' }} onPress={() => setGasIndex(3)}>
                <View style={{ width: '100%', height: 100, borderColor: gasIndex === 3 ? 'blue' : '#e8e8e8', borderRadius: 10, borderWidth: 1, ...rowCenter, }}>
                  <Text style={{ color: '#000' }}>自定义</Text>
                </View>
              </TouchableOpacity>
            </View>
            {
              gasIndex === 3
              &&
              <View style={{ ...mt1, ...p1, backgroundColor: '#f1f1f1' }}>
                <Text style={{ color: '#000' }}>自定义矿工费</Text>
                <View style={{ ...mt1, ...rowBetween }}>
                  <View style={{ flex: 1 }}>
                    <Text>Gas Price(Gwei)</Text>
                    <TextInput value={activeGas.gasPrice} onChangeText={e => {
                      activeGas.gasPrice = e;
                      setActiveGas({ ...activeGas });
                    }} style={{ backgroundColor: '#fff', paddingTop: 0, paddingBottom: 0, width: '80%', ...mt5px }} maxLength={8} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text>Gas Limit</Text>
                    <TextInput value={activeGas.gasLimit} onChangeText={e => {
                      activeGas.gasLimit = e;
                      setActiveGas({ ...activeGas });
                    }} style={{ backgroundColor: '#fff', paddingTop: 0, paddingBottom: 0, width: '80%', ...mt5px }} maxLength={8} />
                  </View>
                </View>
                <View style={{ ...rowBetween, ...mt1 }}>
                  <Text>预估时间：3秒</Text>
                  <Text>{toFixed2(fromBigNumber(toBigNumber(toFixed2((Number(activeGas.gasPrice) * Number(activeGas.gasLimit)).toString(), 8), 9), 18), 6)} {active_network.symbol}</Text>
                </View>
              </View>
            }
          </View>
          <View style={mt3}>
            <Button onPress={() => {
              if (!amount) {
                Toast.show('请输入数量');
                return;
              };
              if (Number(balance) < Number(amount)) {
                Toast.show('余额不足');
                return
              };
              setHintVisible(true);
            }}>确认</Button>
          </View>
          <View style={{ height: 30 }}></View>
        </View>
      }
      {/* 扫描二维码 */}
      <Modal visible={qrVisible} animationType='slide'>
        <QRCodeScreen goBack={setQRVisible} cb={scannerCallback} />
      </Modal>
      {/* 交易安全提示 */}
      <BottomSheet isVisible={hintVisible} onBackdropPress={() => setHintVisible(false)}>
        <View style={{ width: deviceWidth, height: deviceHeight / 1.6, backgroundColor: '#fff', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
          <Text style={{ ...tac, ...mt1, ...fz16, color: '#000' }}>转账安全提示</Text>
          <View style={{ width: '100%', height: 1, backgroundColor: '#e8e8e8', ...mt1 }}></View>
          <View style={{ ...rowCenter, ...mt3 }}>
            <View style={{ width: 60, height: 60, backgroundColor: 'red', borderRadius: 30 }}></View>
          </View>
          <Text style={{ ...tac, ...mt1, color: '#000', ...fz14 }}>转账提醒</Text>
          <View style={{ ...plr1, ...mt1 }}>
            <Text>您当前正在进行转账操作，请确保您的接收钱包与当前转出钱包属于同一网络，否则您的财产无法到账！</Text>
            <Text style={{ color: '#000', ...mt1 }}>当前网络</Text>
            <View style={{ width: '100%', ...p1, backgroundColor: '#e8e8e8', ...mt5px }}>
              <Text>{active_network.name}</Text>
            </View>
            <View style={{ ...mt1 }}>
              <Text>不再提醒</Text>
            </View>
            <View style={{ ...mt3 }}>
              <Button onPress={openTransferVisible}>继续转账</Button>
            </View>
          </View>
        </View>
      </BottomSheet>
      {/* 确认交易 */}
      <BottomSheet isVisible={transferVisible} onBackdropPress={() => setTransferVisible(false)}>
        <View style={{ width: deviceWidth, height: deviceHeight / 1.6, backgroundColor: '#fff', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
          <Text style={{ ...tac, ...mt1, ...fz16, color: '#000' }}>交易详情</Text>
          <View style={{ width: '100%', height: 1, backgroundColor: '#e8e8e8', ...mt1 }}></View>
          <Text style={{ ...tac, ...mt2, ...fz16, color: '#000' }}>{amount} {activeToken.symbol}</Text>
          <View style={{ ...mt3, ...plr1 }}>
            <View style={row}>
              <Text style={{ flex: 2 }}>付款地址</Text>
              <Text style={{ flex: 5, color: '#000' }}>{transferParams.from}</Text>
            </View>
            <View style={{ width: '100%', height: 1, backgroundColor: '#e8e8e8', ...mtb2 }}></View>
            <View style={row}>
              <Text style={{ flex: 2 }}>收款地址</Text>
              <Text style={{ flex: 5, color: '#000' }}>{transferParams.to}</Text>
            </View>
            <View style={{ width: '100%', height: 1, backgroundColor: '#e8e8e8', ...mtb2 }}></View>
            <View style={row}>
              <Text style={{ flex: 2 }}>矿工费用</Text>
              <View style={{ flex: 5 }}>
                {
                  activeGas.gasPrice && <Text style={{ color: '#000' }}>{toFixed2(fromBigNumber(toBigNumber(toFixed2((Number(activeGas.gasPrice) * Number(activeGas.gasLimit)).toString(), 8), 9), 18), 6)} {active_network.symbol}</Text>
                }
                <Text>≈ Gas({activeGas.gasLimit}) * Gas Price({activeGas.gasPrice} Gwei)</Text>
              </View>
            </View>
            <View style={{ width: '100%', height: 1, backgroundColor: '#e8e8e8', ...mtb2 }}></View>
            <Button onPress={() => confirmOrder()}>确认支付</Button>
          </View>
        </View>
      </BottomSheet>
      {verifyPwdVisible && <VerifyPasswordModal visible={verifyPwdVisible} setVisible={setVerifyPwdVisible} cb={confirmOrder} />}
      {/* 选择代币 */}
      <BottomSheet isVisible={checkTokenVisible} onBackdropPress={() => setCheckTokenVisible(false)}>
        <ScrollView style={{ width: deviceWidth, height: deviceHeight / 1.6, backgroundColor: '#fff', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
          <CheckToken tokenList={tokenList} network={active_network} click={checkToken} />
        </ScrollView>
      </BottomSheet>
    </ScrollView >
  )
};

const CheckToken = ({ tokenList, network, click }: any) => {
  return (
    <View>
      <Text style={{ ...tac, ...mt1, ...fz16, color: '#000' }}>选择代币</Text>
      <View style={{ width: '100%', height: 1, backgroundColor: '#e8e8e8', ...mt1 }}></View>
      <View style={{ ...plr1 }}>
        <TouchableOpacity style={{ ...rowBetween, ...mt2, ...alignItems }} onPress={() => click({
          contractAddress: '',
          decimals: 18,
          symbol: network.symbol,
        })}>
          <View style={{ ...rowItems }}>
            <View style={{ width: 24, height: 24, backgroundColor: `green`, borderRadius: 15 }}></View>
            <Text style={{ ...fz14, color: '#000', ...ml5px }}>{network.symbol}</Text>
          </View>
          {/* <Text>{toFixed2(fromBigNumber(mainBTCBalance, 18), 4)}</Text> */}
        </TouchableOpacity>
        {
          tokenList.map((item: any, index: number) => {
            return (
              <TouchableOpacity key={index} style={{ ...rowBetween, ...mt2, ...alignItems }} onPress={() => click({
                contractAddress: item.contractAddress,
                decimals: item.decimals,
                symbol: item.symbol,
              })}>
                <View style={{ ...rowItems }}>
                  <View style={{ width: 24, height: 24, backgroundColor: `blue`, borderRadius: 15 }}></View>
                  <Text style={{ ...fz14, color: '#000', ...ml5px }}>{item.symbol}</Text>
                </View>
                <Text>{item.balance ? toFixed2(fromBigNumber(item.balance, item.decimals), 4) : 0}</Text>
              </TouchableOpacity>
            )
          })
        }
      </View>
    </View>
  )
};

const mapStateToProps = (state: any) => {
  return {
    active_network: JSON.parse(state.activeNetwork),
    tokenList: JSON.parse(state.tokenList),
    active_account: JSON.parse(state.activeAccount)
  }
};

export default connect(mapStateToProps)(Transfer);