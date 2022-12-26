import { Text, TextInput, View, Alert, DeviceEventEmitter } from "react-native";
import { globalStyle } from "../../styles";
import { Button } from '@rneui/themed';
import { useState } from 'react';
import { AccountType } from "../../interface";
import { ethers, Wallet } from "ethers";
import { addAccount, updateAccount } from "../../redux/action/accountAction";
import { connect } from "react-redux";
import Toast from "react-native-root-toast";
const { mt1, plr1, mt3 } = globalStyle;
// crop impact suffer region detect ketchup sunset dismiss east awkward school reflect
const ImportMnemonic = ({ add_account, navigation, update_activeAccount }: any) => {

  const [mnemonic, setMnemonic] = useState('');
  const [pwd, setPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [name, setName] = useState('');

  const importWallet = async () => {
    try {
      if (!name) {
        Toast.show('请输入钱包名称')
        return
      };
      if (!pwd) {
        Toast.show('请输入密码')
        return;
      };
      if (pwd.length < 8) {
        Toast.show('密码至少8位')
        return;
      };
      if (pwd !== confirmPwd) {
        Toast.show('密码不一致')
        return;
      };
      if (mnemonic.split(' ').length < 12) {
        Toast.show('请输入正确助记词');
        return;
      };
      if (!ethers.utils.isValidMnemonic(mnemonic)) {
        Toast.show('无效助记词');
        return;
      };
      DeviceEventEmitter.emit('loading', {
        show: true,
        title: '账号创建中'
      });
      setTimeout(async () => {
        let path = "m/44'/60'/0'/0/0"
        let seed = ethers.utils.mnemonicToSeed(mnemonic);
        let hdWallet = ethers.utils.HDNode.fromSeed(seed);
        let wallet = hdWallet.derivePath(path);
        let sign = new Wallet(wallet.privateKey);
        let signPwd = await sign.signMessage(pwd);
        let params: AccountType = {
          address: wallet.address,
          accountName: name,
          privateKey: wallet.privateKey,
          publicKey: wallet.publicKey,
          words: mnemonic,
          pwd: signPwd
        };

        DeviceEventEmitter.emit('loading', {
          show: false,
        });
        add_account(params);
        update_activeAccount(params);
        navigation.navigate('Home');
      }, 0)

    } catch (error) {
      Toast.show('无效助记词');
      DeviceEventEmitter.emit('loading', {
        show: false,
      });
    }
  };

  return (
    <View style={{ ...plr1 }}>
      <View style={{ ...mt1 }}>
        <TextInput value={mnemonic} onChangeText={e => setMnemonic(e)} numberOfLines={4} multiline editable style={{ backgroundColor: '#e8e8e8' }} placeholder="输入助记词，单词以空格隔开。" />
      </View>
      <View style={{ ...mt1 }}>
        <Text>钱包名称</Text>
        <TextInput value={name} onChangeText={e => setName(e)} style={{ borderBottomColor: '#e8e8e8', borderBottomWidth: 1, padding: 0 }} placeholder="输入钱包名称" />
      </View>
      <View style={{ ...mt1 }}>
        <Text>钱包密码</Text>
        <TextInput value={pwd} onChangeText={e => setPwd(e)} secureTextEntry={true} style={{ borderBottomColor: '#e8e8e8', borderBottomWidth: 1, padding: 0 }} placeholder="请输入密码，至少8位" />
      </View>
      <View style={{ ...mt1 }}>
        <Text>确认密码</Text>
        <TextInput value={confirmPwd} secureTextEntry={true} onChangeText={e => setConfirmPwd(e)} style={{ borderBottomColor: '#e8e8e8', borderBottomWidth: 1, padding: 0 }} placeholder="确认密码" />
      </View>
      <View style={{ ...mt3 }}>
        <Button onPress={importWallet}>确认</Button>
      </View>
    </View>
  )
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    add_account: (item: AccountType) => addAccount(dispatch, item),
    update_activeAccount: (item: AccountType) => updateAccount(dispatch, item),
  }
};

export default connect(null, mapDispatchToProps)(ImportMnemonic);