import { useEffect, useRef, useState } from "react";
import { View, SafeAreaView, Dimensions, BackHandler, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import WebView from "react-native-webview";
import { connect } from "react-redux";
import { globalStyle } from "../../styles";
const { rowEnd, alignItems, plr2, ml2 } = globalStyle;
const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

const ChainBrowser = ({ active_network, route, navigation }: any) => {

  const webViewRef = useRef(null);
  const [visible, setVisible] = useState(true);

  const _onNavigationStateChange = (navState: any) => {
    (global as any).isBack = navState.canGoBack;
  };

  // Dapp 路由监听
  const _onBackAndroid = () => {
    if ((global as any).isBack) {
      (webViewRef as any).current.goBack();
      return true;
    }
    return false
  }

  // webview回退事件
  useEffect(() => {
    // 
    BackHandler.addEventListener('hardwareBackPress', _onBackAndroid);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', _onBackAndroid);
    }
  }, []);

  return (
    <SafeAreaView>
      <View style={{ height: 30, width: '100%', ...rowEnd, ...alignItems, ...plr2, backgroundColor: '#8080C0' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: 'yellow' }}>关闭</Text>
        </TouchableOpacity>
        <TouchableOpacity style={ml2} onPress={() => (webViewRef.current as any).reload()}>
          <Text style={{ color: 'yellow' }} >刷新</Text>
        </TouchableOpacity>
      </View>
      <View style={{ width: deviceWidth, height: deviceHeight - 30 }}>
        <WebView
          onLoad={() => setVisible(false)}
          ref={webViewRef}
          source={{ uri: `${active_network.browser}/tx/${route.params.hash}` }}
          onNavigationStateChange={_onNavigationStateChange}
        />
        {
          visible
          &&
          <View style={{ position: "absolute", top: 0, left: 0, display: 'flex', width: deviceWidth, height: deviceHeight, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator
              color="#f58220"
              size="large"
            />
          </View>
        }
      </View>
    </SafeAreaView>
  )
};

const mapStateToProps = (state: any) => {
  return {
    active_network: JSON.parse(state.activeNetwork)
  }
}

export default connect(mapStateToProps)(ChainBrowser);