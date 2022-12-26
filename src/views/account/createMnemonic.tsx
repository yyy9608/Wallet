import { Button } from "@rneui/themed";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { View, Text, SafeAreaView, TextInput, ScrollView } from "react-native";
import Toast from "react-native-root-toast";
import { connect } from "react-redux";
import { globalStyle } from "../../styles";
import { MyStyleSheet } from "../../utils/MyStyleSheet";
const { p1, rowBetween, rowCenter, fz16, fz10, mt2, mt5px, mt5, mt1, mt3 } = globalStyle;

const CreateMnemonic = ({ active_account, navigation }: any) => {
  const [mnemonic, setMnemonic] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [pwd, setPwd] = useState<string>("");
  const [confirmPwd, setConfirmPwd] = useState<string>("");

  const createMnemonic = () => {
    let bytes = ethers.utils.randomBytes(16);
    let mnemonic = ethers.utils.entropyToMnemonic(bytes);
    setMnemonic(mnemonic);
  };

  const toVerifyMnemonic = () => {
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
    navigation.navigate('VerifyMnemonic', { mnemonic, pwd, confirmPwd, name })
  }
  useEffect(() => {
    createMnemonic()
  }, []);

  return (
    <SafeAreaView>
      <ScrollView style={p1}>
        <Text>请按顺序抄写您的助记词</Text>
        <View style={{ ...rowBetween, flexWrap: 'wrap' }}>
          {
            mnemonic
            &&
            mnemonic.split(' ').map((item: string, index: number) => {
              return (
                <View key={index} style={{ ...styles.mnemonicBox, ...rowCenter }}>
                  <View style={styles.serialNumber}>
                    <Text style={{ color: '#e1e1e1', ...fz10 }}>#{index + 1}</Text>
                  </View>
                  <Text style={{ color: '#fff', ...fz16 }}>{item}</Text>
                </View>
              )
            })
          }
        </View>
        <Text style={{ color: 'red', ...mt2 }}>！请把您的助记词放在一个安全的地方,与任何网络隔离。</Text>
        <Text style={{ color: 'red', ...mt5px }}>！不要在网络中（如电子邮件、相册、社交应用程序等）共享和存储助记词。</Text>
        <View style={{ ...mt3 }}>
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

        <View style={mt5}>
          <Button title="验证助记词" radius={50} onPress={toVerifyMnemonic} />
        </View>
      </ScrollView >
    </SafeAreaView>
  )
};

const styles = MyStyleSheet.create({
  mnemonicBox: {
    width: '30%',
    height: 40,
    backgroundColor: 'blue',
    marginTop: 10,
    borderRadius: 5,
    position: 'relative'
  },
  serialNumber: {
    position: 'absolute',
    top: 5,
    left: 5
  }
})

export default CreateMnemonic;