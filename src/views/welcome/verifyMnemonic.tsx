import { Button, Dialog } from "@rneui/themed";
import { ethers, Wallet } from "ethers";
import { useState } from "react";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, DeviceEventEmitter } from "react-native";
import Toast from "react-native-root-toast";
import { connect } from "react-redux";
import { AccountType } from "../../interface";
import { addAccount, updateAccount } from "../../redux/action/accountAction";
import { globalStyle } from "../../styles";
import { MyStyleSheet } from "../../utils/MyStyleSheet";
const { p1, fz10, mt1, mt3, columnBetween, row, fz16 } = globalStyle;

const VerifyMnemonic = ({ route, navigation, add_account, update_activeAccount }: any) => {
  console.log(route.params);

  let [randomMnemonic, setRandomMnemonic] = useState(route.params.mnemonic.split(' ').sort(function () { return 0.5 - Math.random() }) as any);
  let [mnemonic, setMnemonic] = useState([] as any);

  const addMnemonic = (item: string, index: number) => {
    mnemonic.push(item);
    randomMnemonic.splice(index, 1);
    setRandomMnemonic([...randomMnemonic]);
    setMnemonic([...mnemonic]);
  };

  const delMnemonic = (item: string, index: number) => {
    randomMnemonic.push(item);
    mnemonic.splice(index, 1);
    setRandomMnemonic([...randomMnemonic]);
    setMnemonic([...mnemonic]);
  };

  const verifyMnemonic = async () => {
    try {
      if (mnemonic.length < 12) {
        Toast.show('请输入完整助记词');
        return;
      }
      let m = mnemonic.join(' ');
      if (m !== route.params.mnemonic) {
        Toast.show('助记词顺序错误');
        return;
      };
      DeviceEventEmitter.emit('loading', {
        show: true,
        title: '账号创建中'
      });
      setTimeout(async () => {
        let path = "m/44'/60'/0'/0/0"
        let seed = ethers.utils.mnemonicToSeed(m);
        let hdWallet = ethers.utils.HDNode.fromSeed(seed);
        let wallet = hdWallet.derivePath(path);
        let sign = new Wallet(wallet.privateKey);
        let pwd = await sign.signMessage(route.params.pwd);
        let params: AccountType = {
          address: wallet.address,
          accountName: route.params.name,
          privateKey: wallet.privateKey,
          publicKey: wallet.publicKey,
          words: m,
          pwd: pwd
        };
        DeviceEventEmitter.emit('loading', {
          show: false,
        });
        add_account(params);
        update_activeAccount(params);
        navigation.navigate('Home');
      }, 0)

    } catch (error) {
      DeviceEventEmitter.emit('loading', {
        show: false,
      });
    }
  };

  return (
    <SafeAreaView>
      <View style={{ ...columnBetween, height: '100%' }}>
        <ScrollView style={p1}>
          <Text>请按顺序添加助记词</Text>
          <View style={{ ...styles.mnemonicBox, ...mt1, ...row, flexWrap: 'wrap', ...p1 }}>
            {
              mnemonic.map((item: string, index: number) => {
                return (
                  <TouchableOpacity key={index} style={styles.mnemonicBoxItem} onPress={() => delMnemonic(item, index)}>
                    <View style={styles.serialNumber}>
                      <Text style={{ color: '#e1e1e1', ...fz10 }}>#{index + 1}</Text>
                    </View>
                    <Text style={{ color: '#fff', ...fz16 }}>{item}</Text>
                  </TouchableOpacity>
                )
              })
            }
          </View>
          <View style={{ ...styles.mnemonicBox, ...mt3, ...row, flexWrap: 'wrap', ...p1 }}>
            {
              // randomMnemonic.filter((v: any) => v !== null).map((item: string, index: number) => {
              randomMnemonic.map((item: string, index: number) => {
                return (
                  <TouchableOpacity key={index} style={styles.mnemonicBoxItem} onPress={() => addMnemonic(item, index)}>
                    <Text style={{ color: '#fff', ...fz16 }}>{item}</Text>
                  </TouchableOpacity>
                )
              })
            }
          </View>
        </ScrollView>
        <View>
          <Button title="验证" onPress={verifyMnemonic} />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = MyStyleSheet.create({
  mnemonicBox: {
    width: '100%',
    height: 230,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 1.5,
    shadowColor: '#000',
  },
  mnemonicBoxItem: {
    width: '32%',
    height: 40,
    backgroundColor: 'blue',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: '1%'
  },
  serialNumber: {
    position: 'absolute',
    top: 5,
    left: 5
  }
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    add_account: (item: AccountType) => addAccount(dispatch, item),
    update_activeAccount: (item: AccountType) => updateAccount(dispatch, item),
  }
};

export default connect(null, mapDispatchToProps)(VerifyMnemonic);