import { Alert, Text, TextInput, View } from "react-native";
import { globalStyle } from "../../styles";
import { Button } from '@rneui/themed';
import { useState } from "react";
import { ethers } from "ethers";
import { AccountType } from "../../interface";
import { connect } from "react-redux";
import { addAccount } from "../../redux/action/accountAction";
const { mt1, plr1, mt3 } = globalStyle;

const ImportPrivate = ({ add_account, navigation }: any) => {

  const [privateKey, setPrivate] = useState('');
  const [pwd, setPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [name, setName] = useState('');

  const importWallet = () => {
    if (!privateKey) return;
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
    try {
      let wallet = new ethers.Wallet(privateKey);
      let params: AccountType = {
        address: wallet.address,
        accountName: name,
        privateKey: wallet.privateKey,
        publicKey: wallet.publicKey,
        words: '',
        pwd: pwd
      }
      add_account(params);
      navigation.goBack();
    } catch (error) {
      Alert.alert('无效私钥');
    }
  };

  return (
    <View style={{ ...plr1 }}>
      <View style={{ ...mt1 }}>
        <TextInput value={privateKey} onChangeText={e => setPrivate(e)} numberOfLines={4} multiline editable style={{ backgroundColor: '#e8e8e8' }} placeholder="输入明文私钥，请注意大小写" />
      </View>
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

const mapDispatchToProps = (dispatch: any) => {
  return {
    add_account: (item: AccountType) => addAccount(dispatch, item)
  }
};

export default connect(null, mapDispatchToProps)(ImportPrivate);