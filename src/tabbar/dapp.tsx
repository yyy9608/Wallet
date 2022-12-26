import { View, Text, ScrollView, Dimensions, Modal, Alert, SafeAreaView, TextInput, Image, TouchableOpacity } from "react-native";
import { useState, useCallback } from 'react';
import WebView from "react-native-webview";
import { Button } from "@rneui/themed";
import { QRCodeScreen } from "../components/QRCode";
import { globalStyle } from "../styles";
import Toast from "react-native-root-toast";
import { MyStyleSheet } from "../utils/MyStyleSheet";
import browserDappList from '../config/browser/browserConfig';
const { row, p1, fz12, tac, mt2, mr2, p2, rowBetween, alignItems, rowCenter } = globalStyle;

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

const Dapp = ({ navigation }: any) => {

  const [visible, setVisible] = useState(false);
  const [url, setUrl] = useState('');

  const scannerCallback = (value: string) => {
    setVisible(false);
    navigation.navigate('Browser', { browserUrl: value })
  };

  return (
    <SafeAreaView>
      <View style={{ width: deviceWidth, height: deviceHeight }}>
        <View style={{ width: '100%', ...rowBetween, ...alignItems, ...p1, height: 50 }}>
          <TextInput placeholder="输入网址" value={url} onChangeText={e => setUrl(e)} />
          <Text style={{ color: 'blue' }} onPress={() => setVisible(true)}>扫一扫</Text>
        </View>
        <Button onPress={() => {
          if (!url) return Toast.show('输入网址');
          navigation.navigate('Browser', { browserUrl: url })
        }}>搜索</Button>
        <View style={{ ...row, ...p2, flexWrap: 'wrap' }}>
          {
            browserDappList.map((item: any, index: number) => {
              return (
                <TouchableOpacity style={{ width: '25%', ...mt2 }} key={index} onPress={() => navigation.navigate('Browser', { browserUrl: item.url })}>
                  <View style={rowCenter}>
                    <Image source={item.images} resizeMode="cover" style={styles.logo} />
                  </View>
                  <View style={rowCenter}>
                    <View style={{ ...styles.textWidth }}>
                      <Text style={{ ...fz12, ...tac }} numberOfLines={2}>{item.name}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            })
          }
        </View>
        {/* <Button onPress={() => setVisible(true)}>扫码</Button> */}
        <Modal visible={visible} animationType='slide'>
          <QRCodeScreen goBack={setVisible} cb={scannerCallback} />
        </Modal>
      </View>
    </SafeAreaView>
  )
};

const styles = MyStyleSheet.create({
  logo: {
    width: 50,
    height: 50,
    borderRadius: 5
  },
  textWidth: {
    width: 60
  }
})

export default Dapp;