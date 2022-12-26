import { Button } from "@rneui/themed";
import { View, Text, SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { globalStyle } from "../../styles";
import { MyStyleSheet } from "../../utils/MyStyleSheet";
const { p1, rowBetween, rowCenter, fz16, fz10, mt2, mt5px, mt5 } = globalStyle;

const MnemonicList = ({ active_account, navigation }: any) => {
  console.log();

  return (
    <SafeAreaView>
      <View style={p1}>
        <Text>请按顺序抄写您的助记词</Text>
        <View style={{ ...rowBetween, flexWrap: 'wrap' }}>
          {
            active_account.words.split(' ').map((item: string, index: number) => {
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
        <View style={mt5}>
          <Button title="验证助记词" radius={50} onPress={() => navigation.navigate('BackupMnemonic')} />
        </View>
      </View >
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

const mapStateToProps = (state: any) => {
  return {
    active_account: JSON.parse(state.activeAccount)
  }
};

export default connect(mapStateToProps)(MnemonicList);