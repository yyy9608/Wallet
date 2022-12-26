import { View, Dimensions, ActivityIndicator, BackHandler } from "react-native";
import { useState, useRef, useEffect } from 'react';
import WebView, { WebViewMessageEvent } from "react-native-webview";
import MetamaskMobileProvider from "../../utils/browser/Metamask-mobile-provider";
import { InpageDappController, NOTIFICATION_NAMES } from "../../utils/browser/InpageDAppController";
import { JS_POST_MESSAGE_TO_PROVIDER } from "../../utils/browser/sendMessage";
import BrowserAllModal from "./modal/BrowserAllModal";
import { PageMetadata } from "../../interface";
import BrowserPageData from "../../utils/browser/BrowserPageData";
import GetIconsFunction from "../../utils/browser/GetIconsFunction";
const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

const Browser = ({ route }: any) => {

  const [visible, setVisible] = useState(true);
  const [hub] = useState(new InpageDappController());
  const webViewRef = useRef(null);
  const [pageMetadata, setPageMetadata] = useState<PageMetadata>();
  const [connect, setConnect] = useState(false);

  const onMessage = async (e: WebViewMessageEvent | any) => {

    let data: any = null;
    try {
      data = JSON.parse(e.nativeEvent.data);
    } catch (error) {
      return;
    };

    switch (data.type ?? data.name) {
      case 'metadata':
        setPageMetadata(data.payload);
        break;
      case "metamask-provider":
        let resp = await hub.handle(data.origin!, { ...data.data, pageMetadata }, connect);
        let webview = (webViewRef as any).current as WebView;
        webview?.injectJavaScript(JS_POST_MESSAGE_TO_PROVIDER(resp));
        break;
    };

  };

  const _onNavigationStateChange = (navState: any) => {
    (global as any).isBack = navState.canGoBack;
  };

  // Dapp 路由监听
  const _onBackAndroid = () => {
    if ((global as any).isBack) {
      (webViewRef as any).current.goBack();
      return true;
    };
    setConnect(false);
    return false;
  }

  // chainId account改变 触发通知
  const notifyWebView = (appState: any) => {
    const webview = (webViewRef as any).current as WebView;
    webview?.injectJavaScript(JS_POST_MESSAGE_TO_PROVIDER(appState));
  };

  // webview回退事件
  useEffect(() => {
    // 
    BackHandler.addEventListener('hardwareBackPress', _onBackAndroid);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', _onBackAndroid);
    }
  }, []);

  // 监听网络账号切换
  useEffect(() => {

    hub.on(NOTIFICATION_NAMES.chainChanged, notifyWebView);
    hub.on(NOTIFICATION_NAMES.accountsChanged, notifyWebView);
    hub.on('dappConnect', () => {
      setConnect(true);
    })

    if (pageMetadata) ((webViewRef as any)?.current as WebView)?.injectJavaScript(`${BrowserPageData}\ntrue;`);
  }, []);
  // https://cosmictoken.co/

  return (
    <View>
      <View style={{ width: deviceWidth, height: deviceHeight }}>
        <WebView
          ref={webViewRef}
          onLoad={() => setVisible(false)}
          // source={{ uri: "http://192.168.124.67:3000 " }}
          source={{ uri: route.params.browserUrl }}
          onMessage={onMessage}
          onLoadStart={() => {
            const webview = (webViewRef as any).current as WebView;
            webview.injectJavaScript(`${MetamaskMobileProvider}\ntrue;`);
          }}
          injectedJavaScript={`${GetIconsFunction}\ntrue;${BrowserPageData}\ntrue;`}
          onNavigationStateChange={_onNavigationStateChange}
        // injectedJavaScriptBeforeContentLoaded={MetamaskMobileProvider}
        />
        {
          visible
          &&
          <View style={{ position: "absolute", top: 0, left: 0, display: 'flex', width: deviceWidth, height: deviceHeight, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator
              size="large"
            />
          </View>
        }
      </View>
      <BrowserAllModal event={hub} />
    </View>
  )
};

export default Browser;