import { Dialog } from "@rneui/themed";
import { Wallet } from "ethers";
import { useState, useEffect } from "react";
import { Text, View, TextInput, TouchableOpacity } from "react-native";
import Toast from "react-native-root-toast";
import { connect } from "react-redux";
import { globalStyle } from "../styles";
import { MyStyleSheet } from "../utils/MyStyleSheet";
import * as LocalAuthentication from 'expo-local-authentication';
const { tac, fz16, fw550, plr2, mt1, pl5px, pt1, row, rowCenter, rowBetween, tar, plr1, fz12 } = globalStyle;

type SetPasswordModalType = {
  visible: Boolean,
  setVisible: () => void,
  cb: (bool: Boolean) => void
}

const VerifyPasswordModal = ({ setVisible, visible, active_account, cb }: SetPasswordModalType | any) => {

  const [pwd, setPwd] = useState('');
  const [fingerprintEnable, setFingerprintEnable] = useState(false);

  const confirm = async () => {
    if (!pwd) {
      Toast.show('请输入密码');
      return;
    };
    let wallet = new Wallet(active_account.privateKey);
    let signture = await wallet.signMessage(pwd);
    if (signture !== active_account.pwd) {
      Toast.show('密码错误');
      setPwd('');
      return;
    };
    setVisible(false);
    cb(true);
  };

  const verifyFingerprint = async () => {
    let res = await LocalAuthentication.authenticateAsync({
      promptMessage: '指纹识别'
    });
    if (res.success) {
      cb(true);
      setVisible(false);
    };
  };

  useEffect(() => {
    const isFingerprintEnable = async () => {
      let a = await LocalAuthentication.getEnrolledLevelAsync(); //2
      let b = await LocalAuthentication.hasHardwareAsync(); // true
      let c = await LocalAuthentication.isEnrolledAsync(); /// true
      let d = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (a === 2 && b && c && d.length > 0) {
        setFingerprintEnable(true);
      }
    };
    isFingerprintEnable();
  }, []);

  return (
    <Dialog overlayStyle={{ backgroundColor: '#e8e8e8', padding: 0 }} isVisible={visible}>
      <View style={pt1}>
        <View style={{ ...rowBetween, ...plr1 }}>
          <Text style={{ flex: 3 }}></Text>
          <Text style={{ ...tac, ...fz16, ...fw550, flex: 4 }}>输入密码</Text>
          {
            fingerprintEnable
              ?
              <Text style={{ flex: 3, ...tar, ...fz12, color: 'blue' }} onPress={verifyFingerprint}>指纹识别</Text>
              :
              <Text style={{ flex: 3, ...tar, ...fz12, color: 'blue' }}></Text>
          }
        </View>
        <View style={plr2}>
          <TextInput value={pwd} onChangeText={e => setPwd(e)} secureTextEntry style={{ width: '100%', borderColor: '#888', borderWidth: 1, padding: 0, ...mt1, ...pl5px, borderRadius: 5 }} placeholder="请输入密码" />
        </View>
        <View style={{ ...mt1, width: '100%', height: 1, backgroundColor: '#999' }}></View>
        <View style={{ ...row }}>
          <TouchableOpacity style={{ flex: 1, ...styles.buttonBox, ...rowCenter }} onPress={() => setVisible(false)}>
            <Text style={{ color: 'blue' }}>取消</Text>
          </TouchableOpacity>
          <View style={styles.solid}></View>
          <TouchableOpacity style={{ flex: 1, ...styles.buttonBox, ...rowCenter }} onPress={confirm}>
            <Text style={{ color: 'red' }}>确认</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Dialog >
  )
}

const styles = MyStyleSheet.create({
  buttonBox: {
    height: 40
  },
  solid: {
    width: 1,
    height: 40,
    backgroundColor: '#999'
  }
});

const mapStateToProps = (state: any) => {
  return {
    active_account: JSON.parse(state.activeAccount)
  }
};


export default connect(mapStateToProps)(VerifyPasswordModal);