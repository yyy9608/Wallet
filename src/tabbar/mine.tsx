import Clipboard from "@react-native-clipboard/clipboard";
import { Button } from "@rneui/base";
import { Dialog } from "@rneui/themed";
import { BigNumber, ethers } from "ethers";
import React, { useState } from "react";
import { ScrollView, Text, Touchable, SafeAreaView, TouchableOpacity, Dimensions, View, Modal } from "react-native";
import QRCode from "react-native-qrcode-svg";
import Toast from "react-native-root-toast";
import { connect } from "react-redux";
import { QRCodeScreen } from "../components/QRCode";
import SetPasswordModal from "../components/Set-Password-Modal";
import VerifyPasswordModal from "../components/Verify-Password-Modal";
import { globalStyle } from "../styles";
import { signeParse, signeStringify, toBigNumber } from "../utils/wallet";
const { mt2, rowBetween, alignItems, fz16, plr1, rowCenter, mb1, fz18, tac, mt1, p1 } = globalStyle;
const { width: deviceWidth } = Dimensions.get('window');

const Mine = ({ navigation, active_account }: any) => {

  const [qrVisible, setQRVisible] = useState(false);
  const [qrcodeVisible, setqrcodeVisible] = useState(false);
  const [qrStr, setQRStr] = useState('');
  const [verifyPwdVisible, setVerifyPwdVisible] = useState(false);
  const [privateVisible, setPrivateVisible] = useState(false);
  const [currentKey, setCurrentKey] = useState(''); //private mnemonic

  const scannerCallback = async (value: string) => {
    if (!value) return;
    setQRVisible(false);
    let tx = handleTxData(value);

    if (!tx.from || !tx.gasLimit || !tx.gasPrice || !tx.to) {
      Toast.show('无效的参数');
      return;
    }
    let signTx = await handleMainTokenSigner(tx);

    if (!signTx) {
      Toast.show('签名失败');
      return;
    };

    let qrStr = signeStringify({
      walletAddress: active_account.address,
      decimals: tx.decimals,
      signData: signTx,
      contractAddress: tx.data ? tx.to : ''
    });

    setQRStr(qrStr);
    setqrcodeVisible(true);
  };

  const handleMainTokenSigner = async (transaction: any) => {
    let newData = { ...transaction };
    delete newData.decimals
    delete newData.contractAddress
    let wallet = new ethers.Wallet(active_account.privateKey);
    let tx = await wallet.signTransaction(newData);
    return tx;
  };

  const handleTxData = (value: string) => {
    let transaction = signeParse(value);
    transaction.gasPrice = toBigNumber(transaction.gasPrice, 9);
    transaction.gasLimit = BigNumber.from(transaction.gasLimit);
    transaction.decimals = Number(transaction.decimals);
    transaction.nonce = Number(transaction.nonce);
    if (!transaction.data) {
      transaction.value = toBigNumber(transaction.value, transaction.decimals);
    } else {
      transaction.value = BigNumber.from(transaction.value);
    };
    return transaction;
  };

  // 导出助记词
  const exportPrivateAndMnemonic = (bool?: Boolean) => {
    if (!bool) {
      setVerifyPwdVisible(true);
      return;
    };
    currentKey === 'private' && setPrivateVisible(true);
    currentKey === 'mnemonic' && navigation.navigate('MnemonicList');
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <TouchableOpacity onPress={() => navigation.navigate('AddToken')}>
          <View>
            <View style={{ ...rowBetween, ...alignItems, ...mt2, ...plr1 }}>
              <Text style={{ ...fz16 }}>添加代币</Text>
              <Text style={{ ...fz16 }}>{'>'}</Text>
            </View>
            <View style={{ width: '100%', height: 1, backgroundColor: '#c4c4c4', ...mt2 }}></View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AddNetwork')}>
          <View>
            <View style={{ ...rowBetween, ...alignItems, ...mt2, ...plr1 }}>
              <Text style={{ ...fz16 }}>添加网络</Text>
              <Text style={{ ...fz16 }}>{'>'}</Text>
            </View>
            <View style={{ width: '100%', height: 1, backgroundColor: '#c4c4c4', ...mt2 }}></View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
          <View>
            <View style={{ ...rowBetween, ...alignItems, ...mt2, ...plr1 }}>
              <Text style={{ ...fz16 }}>创建账号</Text>
              <Text style={{ ...fz16 }}>{'>'}</Text>
            </View>
            <View style={{ width: '100%', height: 1, backgroundColor: '#c4c4c4', ...mt2 }}></View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ImportPrivate')}>
          <View>
            <View style={{ ...rowBetween, ...alignItems, ...mt2, ...plr1 }}>
              <Text style={{ ...fz16 }}>私钥导入</Text>
              <Text style={{ ...fz16 }}>{'>'}</Text>
            </View>
            <View style={{ width: '100%', height: 1, backgroundColor: '#c4c4c4', ...mt2 }}></View>
          </View>
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={() => navigation.navigate('ImportMnemonic')}>
          <View>
            <View style={{ ...rowBetween, ...alignItems, ...mt2, ...plr1 }}>
              <Text style={{ ...fz16 }}>助记词导入</Text>
              <Text style={{ ...fz16 }}>{'>'}</Text>
            </View>
            <View style={{ width: '100%', height: 1, backgroundColor: '#c4c4c4', ...mt2 }}></View>
          </View>
        </TouchableOpacity> */}
        <TouchableOpacity onPress={() => {
          exportPrivateAndMnemonic();
          setCurrentKey('private')
        }}>
          <View>
            <View style={{ ...rowBetween, ...alignItems, ...mt2, ...plr1 }}>
              <Text style={{ ...fz16 }}>导出私钥</Text>
              <Text style={{ ...fz16 }}>{'>'}</Text>
            </View>
            <View style={{ width: '100%', height: 1, backgroundColor: '#c4c4c4', ...mt2 }}></View>
          </View>
        </TouchableOpacity>
        {
          active_account.words
          &&
          <TouchableOpacity onPress={() => {
            exportPrivateAndMnemonic();
            setCurrentKey('mnemonic')
          }}>
            <View>
              <View style={{ ...rowBetween, ...alignItems, ...mt2, ...plr1 }}>
                <Text style={{ ...fz16 }}>备份助记词</Text>
                <Text style={{ ...fz16 }}>{'>'}</Text>
              </View>
              <View style={{ width: '100%', height: 1, backgroundColor: '#c4c4c4', ...mt2 }}></View>
            </View>
          </TouchableOpacity>
        }
        <TouchableOpacity onPress={() => navigation.navigate('ColdTransfer')}>
          <View>
            <View style={{ ...rowBetween, ...alignItems, ...mt2, ...plr1 }}>
              <Text style={{ ...fz16 }}>冷钱包转账</Text>
              <Text style={{ ...fz16 }}>{'>'}</Text>
            </View>
            <View style={{ width: '100%', height: 1, backgroundColor: '#c4c4c4', ...mt2 }}></View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          // scannerCallback(str)
          setQRVisible(true);
        }}>
          <View>
            <View style={{ ...rowBetween, ...alignItems, ...mt2, ...plr1 }}>
              <Text style={{ ...fz16 }}>冷钱包签名(扫码)</Text>
              <Text style={{ ...fz16 }}>{'>'}</Text>
            </View>
            <View style={{ width: '100%', height: 1, backgroundColor: '#c4c4c4', ...mt2 }}></View>
          </View>
        </TouchableOpacity>
      </ScrollView >
      <Dialog isVisible={qrcodeVisible} onBackdropPress={() => setqrcodeVisible(false)}>
        <View style={rowCenter}>
          <View>
            <Text style={{ ...mb1, ...fz18, ...tac, color: 'red' }}>签名数据</Text>
            <QRCode
              value={qrStr}
              logoBackgroundColor='transparent'
              size={deviceWidth / 2}
            />
          </View>
        </View>
      </Dialog>
      {/* 扫描交易数据 */}
      <Modal visible={qrVisible} animationType='slide'>
        <QRCodeScreen goBack={setQRVisible} cb={scannerCallback} />
      </Modal>
      {/* 导出私钥 验证密码 */}
      {verifyPwdVisible && <VerifyPasswordModal visible={verifyPwdVisible} setVisible={setVerifyPwdVisible} cb={exportPrivateAndMnemonic} />}
      {/* 私钥 */}
      <Dialog isVisible={privateVisible} onBackdropPress={() => setPrivateVisible(false)}>
        <View>
          <Text style={{ ...tac, ...fz16 }}>账号私钥</Text>
          <View style={{ width: '100%', height: 1, backgroundColor: '#e8e8e8', ...mt1 }}></View>
          <View style={{ ...p1, backgroundColor: '#e8e8e8', ...mt1 }}>
            <Text style={{ ...fz16, textAlign: 'justify' }}>{active_account.privateKey}</Text>
          </View>
          <View style={mt1}>
            <Button color="error" title="复制助记词" onPress={() => {
              Clipboard.setString(active_account.privateKey);
              Toast.show('已复制');
            }} />
          </View>
        </View>
      </Dialog>
    </SafeAreaView>
  )
}

const mapStateToProps = (state: any) => {
  return {
    active_account: JSON.parse(state.activeAccount)
  }
};

export default connect(mapStateToProps)(Mine);