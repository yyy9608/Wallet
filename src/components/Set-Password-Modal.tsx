import { Dialog } from "@rneui/themed";
import { Wallet } from "ethers";
import { useState } from "react";
import { Text, View, TextInput, TouchableOpacity } from "react-native";
import Toast from "react-native-root-toast";
import { connect } from "react-redux";
import { AccountType } from "../interface";
import { updateAccountPwd } from "../redux/action/accountAction";
import { globalStyle } from "../styles";
import { MyStyleSheet } from "../utils/MyStyleSheet";
const { tac, fz16, fw550, plr2, mt1, pl5px, pt1, row, rowCenter } = globalStyle;

type SetPasswordModalType = {
  visible: Boolean,
  setVisible: () => void,
}

const SetPasswordModal = ({ setVisible, visible, active_account, update_account_pwd }: SetPasswordModalType | any) => {

  const [pwd, setPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const confirm = async () => {
    if (!pwd) {
      Toast.show('请输入密码');
      return;
    };
    if (pwd.length < 8) {
      Toast.show('密码至少8位');
      return;
    };
    if (pwd !== confirmPwd) {
      Toast.show('两次密码不一致');
      return;
    }
    let wallet = new Wallet(active_account.privateKey);
    let signture = await wallet.signMessage(pwd);
    let params = { ...active_account };
    params.pwd = signture;
    update_account_pwd(params);
    setVisible(false);
    Toast.show('设置成功');
  };

  return (
    <Dialog overlayStyle={{ backgroundColor: '#e8e8e8', padding: 0 }} isVisible={visible}>
      <View style={pt1}>
        <Text style={{ ...tac, ...fz16, ...fw550 }}>设置密码</Text>
        <View style={plr2}>
          <TextInput value={pwd} onChangeText={e => setPwd(e)} secureTextEntry style={{ width: '100%', borderColor: '#888', borderWidth: 1, padding: 0, ...mt1, ...pl5px, borderRadius: 5 }} placeholder="请输入密码" />
        </View>
        <View style={{ ...plr2 }}>
          <TextInput value={confirmPwd} onChangeText={e => setConfirmPwd(e)} secureTextEntry style={{ width: '100%', borderColor: '#888', borderWidth: 1, padding: 0, ...mt1, ...pl5px, borderRadius: 5 }} placeholder="重复输入密码" />
        </View>
        <View style={{ ...mt1, width: '100%', height: 1, backgroundColor: '#999' }}></View>
        <View style={{ ...row }}>
          {/* <TouchableOpacity style={{ flex: 1, ...styles.buttonBox, ...rowCenter }} onPress={() => setVisible(false)}>
            <Text style={{ color: 'blue' }}>取消</Text>
          </TouchableOpacity>
          <View style={styles.solid}></View> */}
          <TouchableOpacity style={{ flex: 1, ...styles.buttonBox, ...rowCenter }} onPress={confirm}>
            <Text style={{ color: 'blue' }}>确认</Text>
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

const mapDispatchToProps = (dispatch: any) => {
  return {
    update_account_pwd: (item: AccountType) => updateAccountPwd(dispatch, item)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(SetPasswordModal);