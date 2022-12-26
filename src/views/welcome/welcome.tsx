import { Button } from "@rneui/themed";
import { View, Text, Dimensions, SafeAreaView, StatusBar } from "react-native";
import { globalStyle } from "../../styles";
const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');
const { p4, columnBetween, tac, fz24, fw550, mt2 } = globalStyle;

const Welcome = ({ navigation }: any) => {

  return (
    <SafeAreaView>
      <StatusBar backgroundColor="#426ab3"/>
      <View style={{ width: deviceWidth, height: deviceHeight, backgroundColor: '#426ab3', ...p4, ...columnBetween }}>
        <View>
          <Text style={{ ...tac, ...fz24, color: '#faa755', ...fw550 }}>Welcome To HLWallet</Text>
        </View>
        <View>
          <Button title="创建助记词" onPress={() => navigation.navigate('CreateMnemonic')} />
          <View style={mt2}>
            <Button title="导入助记词" onPress={() => navigation.navigate('ImportMnemonic')} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
};

export default Welcome;