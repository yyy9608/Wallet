import { BottomSheet, Button, Dialog } from "@rneui/themed";
import { BigNumber, Contract, ethers } from "ethers";
import { useEffect, useState } from "react";
import { Modal, Text, TextInput, View, SafeAreaView, TouchableOpacity, ScrollView, DeviceEventEmitter } from "react-native";
import { Dimensions } from 'react-native';
import QRCode from "react-native-qrcode-svg";
import Toast from "react-native-root-toast";
import { connect } from "react-redux";
import { QRCodeScreen } from "../../components/QRCode";
import { eventName } from "../../config/eventName";
import { _abi } from "../../contract/abi";
import { IERC20__factory } from "../../contract/IERC20__factory";
import { SignerDataType, TransactionRequest } from "../../interface";
import { globalStyle } from "../../styles";
import { fromBigNumber, signeParse, signeStringify, toBigNumber, toFixed2 } from "../../utils/wallet";
const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');
const { plr1, mt1, mt5px, p1, rowBetween, rowItems, ml1, alignItems, fz10, mt3, tac, rowCenter, fz16, fz14, ml5px, mt2 } = globalStyle;

const ColdTransfer = ({ active_network, tokenList, active_account, navigation }: any) => {
  // 0x6b94309caa679D1522dfeB3CC2864f573A0D352f
  // 0x2ADDed672bacEfe857a408B577CB7DF1f6687c07
  const [inputVisible, setInputVisible] = useState(false);
  const [address, setAddress] = useState('0x2ADDed672bacEfe857a408B577CB7DF1f6687c07');
  const [fromAddress, setFromAddress] = useState('0x6b94309caa679D1522dfeB3CC2864f573A0D352f');
  const [addressIndex, setAddressIndex] = useState(0);
  const [qrVisible, setQRVisible] = useState(false);
  const [balance, setBalance] = useState('0');
  const [gasList, setGasList] = useState([
    { title: "慢", gasPrice: '5', gasLimit: '21000' },
    { title: "推荐", gasPrice: '5.5', gasLimit: '21000' },
    { title: "快", gasPrice: '6', gasLimit: '21000' },
  ]);
  const [amount, setAmount] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [activeGas, setActiveGas] = useState({ title: "推荐", gasPrice: '5.5', gasLimit: '21000' } as any);
  const [gasIndex, setGasIndex] = useState(1);
  const [qrcodeVisible, setqrcodeVisible] = useState(false);
  const [checkTokenVisible, setCheckTokenVisible] = useState(false);
  const [qrcodeStr, setQrCodeStr] = useState('');
  const [activeToken, setActiveToken] = useState({
    contractAddress: '',
    decimals: 18,
    symbol: active_network.symbol,
  });
  const [scanSignerData, setScanSignerData] = useState(false);
  // let str = "walletAddress:0x6b94309caa679D1522dfeB3CC2864f573A0D352f||decimals:18||signData:0xf8a980850271d94900828da694bd2891a8eb78eccf4a926bf7040f905d78c8eba480b844a9059cbb0000000000000000000000002added672bacefe857a408b577cb7df1f6687c070000000000000000000000000000000000000000000000000de0b6b3a76400001ca048cc725839896ba4af113812d08c02d11ba7382bd2dae939ad00653530fc1618a053d782b2c0dcbb4b816197ab126adfcea68d1faa6aea8d43fbc8499af4d4e3d2||contractAddress:0xbD2891A8EB78eccF4A926Bf7040f905d78c8eba4||";
  // 扫描签名数据二维码callback
  const scanSignerCallback = (value: string) => {
    let signerData = signeParse(value);
    if (!signerData.walletAddress || !signerData.decimals || !signerData.signData || !signerData.contractAddress) {
      Toast.show('无效的参数');
      return;
    }
    signerData.decimals = Number(signerData.decimals);
    let params = {
      from: 'cold-wallet-transfer',
      to: 'routes',
      method: 'transfer',
      data: signerData as SignerDataType,
      contractAddress: activeToken.contractAddress,
      decimals: activeToken.decimals
    };
    DeviceEventEmitter.emit(eventName.TRANSFER, params);
    navigation.navigate('Mine');
  };

  // 扫描地址callback
  const scannerCallback = (value: string) => {
    setQRVisible(false);
    if (ethers.utils.isAddress(value)) {
      if (addressIndex === 0) {
        setFromAddress(value);
      } else {
        setAddress(value);
      }
    } else {
      Toast.show('无效地址');
    }
  };

  // 选择token
  const checkToken = (item: any) => {
    setActiveToken(item);
    setTokenAddress(item.contractAddress);
    setCheckTokenVisible(false);
  };

  // 获取gasPrice
  const getParams = async () => {
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

  // 获取 gasLimit
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

  // 创建二维码
  const createQRcode = async () => {
    if (!amount) {
      Toast.show('请输入数量');
      return;
    };
    if (Number(balance) < Number(amount)) {
      Toast.show('余额不足');
      return
    };

    let transferParams: any = {
      from: active_account.address,
      to: address,
      gasLimit: activeGas.gasLimit,
      gasPrice: activeGas.gasPrice,
      value: amount,
      decimals: activeToken.decimals,
      nonce: 0,
      data: ''
    };

    let provider = new ethers.providers.JsonRpcProvider(active_network.rpc);
    if (activeToken.contractAddress) {
      let _contract = IERC20__factory.connect(activeToken.contractAddress, provider);
      let nonceRequest = provider.getTransactionCount(fromAddress);
      let dataRequest = _contract.populateTransaction.transfer(address, toBigNumber(amount, activeToken.decimals));
      let [nonce, data] = await Promise.all([nonceRequest, dataRequest]);
      transferParams.nonce = nonce;
      transferParams.data = data.data;
      transferParams.to = data.to;
      transferParams.value = '0';
    } else {
      transferParams.nonce = await provider.getTransactionCount(fromAddress);
    };
    let str = signeStringify(transferParams);
    setQrCodeStr(str);
    setqrcodeVisible(true);
  }

  useEffect(() => {
    getParams();
    getGasLimit();
  }, [tokenAddress, amount]);

  useEffect(() => {
    if (ethers.utils.isAddress(fromAddress) && ethers.utils.isAddress(address)) {
      setInputVisible(true);
    };
  }, [fromAddress, address])

  return (
    <SafeAreaView>
      <ScrollView style={{ ...p1 }}>
        {
          !inputVisible &&
          <View>
            <View style={{ ...rowBetween, ...alignItems, ...mt5px }}>
              <TextInput
                value={fromAddress}
                onChangeText={e => {
                  setFromAddress(e);
                }}
                style={{ backgroundColor: '#fff', width: '90%' }}
                placeholder="请输入From地址" />
              <Text style={{ color: 'blue' }} onPress={() => {
                setAddressIndex(0);
                setQRVisible(true)
              }}>扫码</Text>
            </View>
            <Text style={{ ...mt1 }}>转账至</Text>
            <View style={{ ...rowBetween, ...alignItems, ...mt1 }}>
              <TextInput
                value={address}
                onChangeText={e => {
                  setAddress(e);
                }}
                style={{ backgroundColor: '#fff', width: '90%' }}
                placeholder="请输入To地址" />
              <Text style={{ color: 'blue' }} onPress={() => {
                setAddressIndex(1);
                setQRVisible(true)
              }}>扫码</Text>
            </View>
          </View>
        }

        {
          inputVisible
          &&
          <View style={mt5px}>
            <View style={{ width: '100%', ...p1, borderWidth: 1, borderColor: 'blue', ...rowBetween, ...alignItems }}>
              <View style={{ ...rowItems }}>
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'blue' }}></View>
                <Text style={{ width: '85%', ...ml1 }}>{fromAddress}</Text>
              </View>
              <View>
                <Text onPress={() => {
                  setFromAddress('');
                  setInputVisible(false);
                }}>X</Text>
              </View>
            </View>
            <Text style={{ ...mt1 }}>转账至</Text>
            <View style={{ width: '100%', ...p1, ...mt1, borderWidth: 1, borderColor: 'blue', ...rowBetween, ...alignItems }}>
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
                          <Text style={{ ...tac, ...mt1, ...fz10 }}>{toFixed2(fromBigNumber(toBigNumber(toFixed2((Number(activeGas.gasPrice) * Number(activeGas.gasLimit)).toString(), 8), 9), 18), 6)} {active_network.symbol}</Text>
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
                      }} style={{ backgroundColor: '#fff', paddingTop: 0, paddingBottom: 0, width: '80%', ...mt5px }} />
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
              <Button onPress={createQRcode}>生成二维码</Button>
            </View>
            <View style={mt3}>
              <Button onPress={() => {
                // scanSignerCallback(str);
                setScanSignerData(true)
              }} color='warning'>确认转账(扫码)</Button>
            </View>
            <View style={{ height: 30 }}></View>
          </View>
        }

      </ScrollView>
      {/* 二维码 */}
      <Dialog isVisible={qrcodeVisible} onBackdropPress={() => setqrcodeVisible(false)}>
        <View style={rowCenter}>
          <QRCode
            value={qrcodeStr}
            logoBackgroundColor='transparent'
            size={deviceWidth / 2}
          />
        </View>
      </Dialog>
      {/* 扫描签名数据二维码 */}
      <Modal visible={scanSignerData} animationType='slide'>
        <QRCodeScreen goBack={setScanSignerData} cb={scanSignerCallback} />
      </Modal>
      {/* 扫描地址二维码 */}
      <Modal visible={qrVisible} animationType='slide'>
        <QRCodeScreen goBack={setQRVisible} cb={scannerCallback} />
      </Modal>
      {/* 选择币 */}
      <BottomSheet isVisible={checkTokenVisible} onBackdropPress={() => setCheckTokenVisible(false)}>
        <ScrollView style={{ width: deviceWidth, height: deviceHeight / 1.6, backgroundColor: '#fff', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
          <CheckToken tokenList={tokenList} network={active_network} click={checkToken} />
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
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

export default connect(mapStateToProps)(ColdTransfer);