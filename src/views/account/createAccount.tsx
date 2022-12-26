import { Alert, Text, TextInput, View } from "react-native";
import { globalStyle } from "../../styles";
import { Button } from '@rneui/themed';
import { useState } from "react";
import { ethers } from "ethers";
import { AccountType } from "../../interface";
import { connect } from "react-redux";
import { addAccount } from "../../redux/action/accountAction";
import { addPath } from "../../redux/action/pathAction";
const { mt1, plr1, mt3 } = globalStyle;

const CreateAccount = ({ add_account, navigation, account, pathReducer, add_pathReducer }: any) => {

  const [pwd, setPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [name, setName] = useState('');

  const importWallet = async () => {

    if (!pwd) return;
    if (!confirmPwd) return;
    if (!name) return;
    if (pwd.length < 8) {
      Alert.alert('密码至少8位');
      return;
    };
    if (pwd !== confirmPwd) {
      Alert.alert('密码不一致');
      return;
    };

    let wallet = ethers.Wallet.fromMnemonic(account.words, `m/44'/60'/0'/0/${pathReducer}`);
    let wt = new ethers.Wallet(wallet.privateKey);
    let signture = await wt.signMessage(pwd);
    let params: AccountType = {
      address: wallet.address,
      accountName: name,
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      words: '',
      pwd: signture,
      backup: true
    }
    add_account(params);
    add_pathReducer();
    navigation.goBack();
  };

  return (
    <View style={{ ...plr1 }}>
      <View style={{ ...mt1 }}>
        <Text>钱包名称</Text>
        <TextInput value={name} onChangeText={e => setName(e)} style={{ borderBottomColor: '#e8e8e8', borderBottomWidth: 1, padding: 0 }} placeholder="输入钱包名称" />
      </View>
      <View style={{ ...mt1 }}>
        <Text>钱包密码</Text>
        <TextInput value={pwd} onChangeText={e => setPwd(e)} style={{ borderBottomColor: '#e8e8e8', borderBottomWidth: 1, padding: 0 }} placeholder="请输入密码，至少8位" secureTextEntry={true} />
      </View>
      <View style={{ ...mt1 }}>
        <Text>确认密码</Text>
        <TextInput value={confirmPwd} onChangeText={e => setConfirmPwd(e)} style={{ borderBottomColor: '#e8e8e8', borderBottomWidth: 1, padding: 0 }} placeholder="确认密码" secureTextEntry={true} />
      </View>
      <View style={{ ...mt3 }}>
        <Button onPress={importWallet}>导入钱包</Button>
      </View>
    </View>
  )
};

const mapStateToProps = (state: any) => {
  return {
    account: JSON.parse(state.accountList)[0],
    pathReducer: state.pathReducer
  }
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    add_account: (item: AccountType) => addAccount(dispatch, item),
    add_pathReducer: () => addPath(dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateAccount);