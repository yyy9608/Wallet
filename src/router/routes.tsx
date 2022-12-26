import { View, DeviceEventEmitter, Alert } from "react-native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from "../tabbar/home";
import Dapp from "../tabbar/dapp";
import Mine from "../tabbar/mine";
import Swap from "../tabbar/swap";
import AddNetwork from "../views/network/addNetwork";
import NetWorkList from "../components/Network-List-Modal";
import ImportPrivate from "../views/account/importPrivate";
import ImportMnemonic from "../views/account/importMnemonic";
import CreateAccount from "../views/account/createAccount";
import AccountListModal from "../components/Account-List-Modal";
import AddToken from "../views/token/addToken";
import CollecMmoney from "../views/transaction/collect-money";
import Transfer from "../views/transaction/transfer";
import TokenDetail from "../views/token/tokenDetail";
import TransferDetail from "../views/transaction/transferDetail";
import Browser from "../views/dapp/browser";
import ColdTransfer from '../views/cold-wallet/transfer';
import MineNFTList from "../views/nft/MineNFTList";
import NFTTransfer from "../views/nft/NFTTransfer";
import BackupMnemonic from "../views/account/backupMnemonic";
import MnemonicList from "../views/account/mnemonicList";
import ChainBrowser from '../views/transaction/chainBrowser';
import Welcome from "../views/welcome/welcome";
import VerifyMnemonic from "../views/welcome/verifyMnemonic";
import CreateMnemonic from "../views/account/createMnemonic";
import SwapExchangeLog from "../views/swap/swapExchangeLog";
import { globalStyle } from "../styles";
import { useEffect, useState } from "react";
import { eventName } from "../config/eventName";
import { LsyWalletTransferRequest } from "../interface";
import { sendSignerTransaction, transferMainToken, transferNFT, transferToken } from "../utils/wallet";
import { connect } from "react-redux";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const Tabbar = () => {
  return (
    <Tab.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
      <Tab.Screen name="Home" component={Home} options={{
        title: '资产', headerLeft: () => <View style={{ ...globalStyle.ml1 }}><NetWorkList /></View>, headerRight: () => <View style={{ ...globalStyle.mr1 }}><AccountListModal /></View>
      }} ></Tab.Screen>
      <Tab.Screen name="Swap" component={Swap} options={{ title: 'Swap' }}></Tab.Screen>
      <Tab.Screen name="Dapp" component={Dapp} options={{ title: 'Dapp' }}></Tab.Screen>
      <Tab.Screen name="Mine" component={Mine} options={{ title: '个人中心' }}></Tab.Screen>
    </Tab.Navigator>
  )
};



const MyApp = ({ account_list }: any) => {

  let [listener] = useState(null as any);

  useEffect(() => {
    if (listener) return;
    listener = DeviceEventEmitter.addListener(eventName.TRANSFER, (e: LsyWalletTransferRequest) => {
      // 转账token和主币
      if (e.from === 'transfer' && e.to === 'routes' && e.method === 'transfer') {
        if (e.contractAddress) {
          transferToken(e);
        } else {
          transferMainToken(e);
        }
      };
      // 冷钱包转账
      if (e.from === 'cold-wallet-transfer' && e.to === 'routes' && e.method === 'transfer') {
        sendSignerTransaction(e.data);
      };
      // NFT转账
      if (e.from === 'nft-transfer' && e.to === 'routes' && e.method === 'transferFrom') {
        transferNFT(e);
      }
    });
    return () => DeviceEventEmitter.removeAllListeners(eventName.TRANSFER);
  }, []);

  const isRouter = () => {
    if (account_list.length > 0) return 'Home';
    return 'Welcome'
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerTitleAlign: 'center', headerShadowVisible: false }} initialRouteName={isRouter()}>
        <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }}></Stack.Screen>
        <Stack.Screen name="Home" component={Tabbar} options={{ headerShown: false }}></Stack.Screen>
        <Stack.Screen name="AddNetwork" component={AddNetwork} options={{ headerShown: true, title: "添加网络" }}></Stack.Screen>
        <Stack.Screen name="ImportPrivate" component={ImportPrivate} options={{ headerShown: true, title: "私钥导入" }}></Stack.Screen>
        <Stack.Screen name="ImportMnemonic" component={ImportMnemonic} options={{ headerShown: true, title: "助记词导入" }}></Stack.Screen>
        <Stack.Screen name="CreateAccount" component={CreateAccount} options={{ headerShown: true, title: "创建账号" }}></Stack.Screen>
        <Stack.Screen name="AddToken" component={AddToken} options={{ headerShown: true, title: "添加代币" }}></Stack.Screen>
        <Stack.Screen name="Transfer" component={Transfer} options={{ headerShown: true, title: "转账" }}></Stack.Screen>
        <Stack.Screen name="TokenDetail" component={TokenDetail} options={{ headerShown: true, title: "Token详情" }}></Stack.Screen>
        <Stack.Screen name="TransferDetail" component={TransferDetail} options={{ headerShown: true, title: "转账详情" }}></Stack.Screen>
        <Stack.Screen name="Browser" component={Browser} options={{ headerShown: false, title: "Browser Tab" }}></Stack.Screen>
        <Stack.Screen name="ColdTransfer" component={ColdTransfer} options={{ headerShown: true, title: "冷钱包转账" }}></Stack.Screen>
        <Stack.Screen name="MineNFTList" component={MineNFTList} options={{ headerShown: true, title: "NFT详情" }}></Stack.Screen>
        <Stack.Screen name="NFTTransfer" component={NFTTransfer} options={{ headerShown: true, title: "NFT转账" }}></Stack.Screen>
        <Stack.Screen name="MnemonicList" component={MnemonicList} options={{ headerShown: true, title: "备份助记词" }}></Stack.Screen>
        <Stack.Screen name="BackupMnemonic" component={BackupMnemonic} options={{ headerShown: true, title: "备份助记词" }}></Stack.Screen>
        <Stack.Screen name="CreateMnemonic" component={CreateMnemonic} options={{ headerShown: true, title: "创建助记词" }}></Stack.Screen>
        <Stack.Screen name="VerifyMnemonic" component={VerifyMnemonic} options={{ headerShown: true, title: "验证助记词" }}></Stack.Screen>
        <Stack.Screen name="SwapExchangeLog" component={SwapExchangeLog} options={{ headerTintColor: "#fff", headerShown: true, title: "Swap兑换记录", headerStyle: { backgroundColor: '#479AC7' }, headerTitleStyle: { color: '#fff' } }}></Stack.Screen>
        <Stack.Screen name="ChainBrowser" component={ChainBrowser} options={{ headerShown: false, title: "" }}></Stack.Screen>
        <Stack.Screen name="CollecMmoney" component={CollecMmoney} options={{ headerShown: true, title: "收款", headerTintColor: '#fff', headerShadowVisible: false, headerStyle: { backgroundColor: 'blue' }, headerTitleStyle: { color: '#fff' } }}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  )
};

const mapStateToProps = (state: any) => {
  return {
    account_list: JSON.parse(state.accountList)
  }
};

export default connect(mapStateToProps)(MyApp);