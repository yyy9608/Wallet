import { Button } from "@rneui/themed";
import { BigNumber, ethers, Wallet } from "ethers";
import { useState, useEffect } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View, ScrollView, SafeAreaView, DeviceEventEmitter, Alert } from "react-native";
import Toast from "react-native-root-toast";
import { connect } from "react-redux";
import { QRCodeScreen } from "../../components/QRCode";
import VerifyPasswordModal from "../../components/Verify-Password-Modal";
import { eventName } from "../../config/eventName";
import { IERC20__factory } from "../../contract/IERC20__factory";
import { globalStyle } from "../../styles";
import { fromBigNumber, toBigNumber, toFixed2, wei } from "../../utils/wallet";

const { mt1, mt5px, p1, rowBetween, rowItems, ml1, alignItems, fz10, tac, rowCenter, columnBetween } = globalStyle;

const NFTTransfer = ({ active_network, route, active_account, navigation }: any) => {

  const [activeGas, setActiveGas] = useState({ title: "推荐", gasPrice: '5.5', gasLimit: '21000' } as any);
  const [gasIndex, setGasIndex] = useState(1);
  const [balance, setBalance] = useState(wei.Zero);
  const [toAddress, setToAddress] = useState('0x2ADDed672bacEfe857a408B577CB7DF1f6687c07');
  const [gasList, setGasList] = useState([
    { title: "慢", gasPrice: '5', gasLimit: '21000' },
    { title: "推荐", gasPrice: '5.5', gasLimit: '21000' },
    { title: "快", gasPrice: '6', gasLimit: '21000' },
  ]);
  const [inputVisible, setInputVisible] = useState(false);
  const [qrVisible, setQRVisible] = useState(false);
  const [verifyPwdVisible, setVerifyPwdVisible] = useState(false);

  // 获取矿工费用
  const getGasLimit = async () => {
    let provider = new ethers.providers.JsonRpcProvider(active_network.rpc);
    let _contract = IERC20__factory.connect(route.params.contract, provider);
    let gasPriceRQS = provider.getGasPrice();
    let balanceRQS = provider.getBalance(active_account.address);
    let gasLimitRQS = _contract.estimateGas.transferFrom(active_account.address, toAddress, route.params.tokenId);
    let [gasPrice, gasLimit, b] = await Promise.all([gasPriceRQS, gasLimitRQS, balanceRQS]);
    gasList[0].gasLimit = gasLimit.toString();
    gasList[1].gasLimit = gasLimit.toString();
    gasList[2].gasLimit = gasLimit.toString();
    gasList[0].gasPrice = fromBigNumber(gasPrice, 9);
    gasList[1].gasPrice = (Number(fromBigNumber(gasPrice, 9)) + 0.5).toString();
    gasList[2].gasPrice = (Number(fromBigNumber(gasPrice, 9)) + 1).toString();
    setGasIndex(1);
    setActiveGas(gasList[1]);
    setGasList([...gasList]);
    setBalance(b);
  };

  // 扫描地址callback
  const scannerCallback = (value: string) => {
    setQRVisible(false);
    if (ethers.utils.isAddress(value)) {
      setToAddress(value);
    } else {
      Toast.show('无效地址');
    }
  };

  const confrimTransferFrom = async (bool?: Boolean) => {
    try {
      if (!bool) {
        setVerifyPwdVisible(true);
        return;
      };
      let requestParams: any = {
        from: active_account.address,
        to: toAddress,
        gasLimit: BigNumber.from(activeGas.gasLimit),
        gasPrice: toBigNumber(activeGas.gasPrice, 9),
        nonce: 0,
        data: ''
      };
      let provider = new ethers.providers.JsonRpcProvider(active_network.rpc);
      let _contract = IERC20__factory.connect(route.params.contract, provider);
      let nonceRequest = provider.getTransactionCount(active_account.address);
      let wallet = new Wallet(active_account.privateKey);
      let dataRequest = _contract.populateTransaction.transferFrom(active_account.address, toAddress, BigNumber.from(route.params.tokenId));
      let [nonce, data] = await Promise.all([nonceRequest, dataRequest]);
      requestParams.data = data.data;
      requestParams.to = data.to;
      requestParams.nonce = nonce;
      let signTx = await wallet.signTransaction(requestParams);
      let params = {
        from: 'nft-transfer',
        to: 'routes',
        method: 'transferFrom',
        data: {
          signData: signTx,
          nftItem: { ...route.params }
        }
      };
      DeviceEventEmitter.emit(eventName.TRANSFER, params);
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert(`${error}`);
    }
  };


  useEffect(() => {
    if (ethers.utils.isAddress(toAddress)) {
      setInputVisible(true);
      getGasLimit();
    }
  }, [toAddress]);

  return (
    <SafeAreaView>
      <View style={{ ...columnBetween, height: '100%' }}>
        <ScrollView style={{ ...p1 }}>
          <Text style={{ ...mt1 }}>转账至</Text>
          {
            !inputVisible
            &&
            <View style={{ ...rowBetween, ...alignItems, ...mt1 }}>
              <TextInput
                value={toAddress}
                onChangeText={e => {
                  setToAddress(e);
                }}
                style={{ backgroundColor: '#fff', width: '90%' }}
                placeholder="请输入To地址" />
              <Text style={{ color: 'blue' }} onPress={() => {
                setQRVisible(true)
              }}>扫码</Text>
            </View>
          }
          {/* ----------------------------------------------------- */}
          {
            inputVisible
            &&
            <View style={{ ...mt1 }}>
              {/*  */}
              <View style={{ width: '100%', ...p1, borderWidth: 1, borderColor: 'blue', ...rowBetween, ...alignItems }}>
                <View style={{ ...rowItems }}>
                  <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'blue' }}></View>
                  <Text style={{ width: '85%', ...ml1 }}>{toAddress}</Text>
                </View>
                <View>
                  <Text onPress={() => {
                    setToAddress('');
                    setInputVisible(false);
                  }}>X</Text>
                </View>
              </View>

              {/*  */}
              <View style={{ backgroundColor: '#fff', ...p1, ...mt1 }}>
                <Text>发送NFT</Text>
                <Text style={{ ...mt1 }}>序号：#{route.params.tokenId.toString()}</Text>
                <View style={{ width: '100%', height: 1, backgroundColor: '#e8e8e8', ...mt1 }}></View>
                <View style={{ ...mt1, ...rowBetween }}>
                  <Text>钱包余额</Text>
                  <Text>{toFixed2(fromBigNumber(balance, active_network.decimals), 6)} {active_network.symbol}</Text>
                </View>
              </View>
              {/*  */}
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
            </View>
          }
        </ScrollView>
        <Button title="发送" onPress={() => confrimTransferFrom()} />
      </View>
      {verifyPwdVisible && <VerifyPasswordModal visible={verifyPwdVisible} setVisible={setVerifyPwdVisible} cb={confrimTransferFrom} />}
      {/* 扫描地址二维码 */}
      <Modal visible={qrVisible} animationType='slide'>
        <QRCodeScreen goBack={setQRVisible} cb={scannerCallback} />
      </Modal>
    </SafeAreaView>

  )
};

const mapStateToProps = (state: any) => {
  return {
    active_network: JSON.parse(state.activeNetwork),
    active_account: JSON.parse(state.activeAccount)
  }
}

export default connect(mapStateToProps)(NFTTransfer);