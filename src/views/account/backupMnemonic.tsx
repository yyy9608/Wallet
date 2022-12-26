import { Button } from "@rneui/themed";
import { useEffect, useState } from "react";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import Toast from "react-native-root-toast";
import { connect } from "react-redux";
import { AccountType } from "../../interface";
import { updateAccountBackup } from "../../redux/action/accountAction";
import { globalStyle } from "../../styles";
import { MyStyleSheet } from "../../utils/MyStyleSheet";
const { p1, fz10, mt1, mt3, columnBetween, row, fz16 } = globalStyle;

const BackupMnemonic = ({ active_account, update_account_backup, navigation }: any) => {

  let [randomMnemonic, setRandomMnemonic] = useState(active_account.words.split(' ').sort(function () { return 0.5 - Math.random() }) as any);
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

  const verifyMnemonic = () => {

    if (mnemonic.length < 12) {
      Toast.show('请输入完整助记词');
      return;
    }
    let m = mnemonic.join(' ');
    if (m !== active_account.words) {
      Toast.show('助记词顺序错误');
      return;
    };
    let params: AccountType = { ...active_account };
    params.backup = false;
    update_account_backup(params);
    navigation.navigate('Home');
    Toast.show('验证通过');
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

const mapStateToProps = (state: any) => {
  return {
    active_account: JSON.parse(state.activeAccount)
  }
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    update_account_backup: (item: AccountType) => updateAccountBackup(dispatch, item)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BackupMnemonic);