import '@ethersproject/shims';
import { Alert, Text, TextInput, View } from "react-native";
import { Button } from '@rneui/themed';
import { globalStyle } from "../../styles";
import { useState } from "react";
import { ethers } from "ethers";
import { connect } from 'react-redux';
import { NetworkType } from '../../interface';
import { addNetwork } from '../../redux/action/netWorkAction';
const { plr1, p1, mt1, rowItems, mt3 } = globalStyle;

// {
//   "name": "以太坊 Ethereum 主网络",
//   "rpc": "https://mainnet.infura.io/v3/61979dd617324f26850d61bedaf68ac1",
//   "chainID": "97",
//   "symbol": "ETH",
//   "browser": "https://etherscan.io",
//   "decimals": 18,
//   "image": "bnb.svg",
//   "remove": true
// },

const AddNetwork = ({ navigation, add_network, active_account }: any) => {

  const [name, setName] = useState('');
  const [rpc, setRpc] = useState('');
  const [chainId, setChainId] = useState('');
  const [symbol, setSymbol] = useState('');
  const [browser, setBrowser] = useState('');

  const saveNetwork = async () => {
    if (name === '') return;
    if (rpc === '') return;
    if (chainId === '') return;
    if (symbol === '') return;
    if (browser === '') return;
    try {
      let provider = new ethers.providers.JsonRpcProvider(rpc);
      await provider.getBalance(active_account.address);
      let params = {
        "name": name,
        "rpc": rpc,
        "chainID": chainId,
        "symbol": symbol,
        "browser": browser,
        "decimals": 18,
        "image": "",
        "remove": false
      };
      add_network(params);
      navigation.goBack();
    } catch (error) {
      Alert.alert('无效RPC');
    }
  };

  return (
    <View style={{ ...plr1 }}>
      <View style={{ width: '100%', ...p1, ...mt1, backgroundColor: '#FDF8EB', borderColor: '#F7E00A', borderWidth: 1 }}>
        <Text style={{ color: '#f7800a' }}>恶意网络提供商可能会显示区块的状态并记录您的网络活动，只添加您信任的自定义网络</Text>
      </View>
      <View style={{ ...mt1, ...rowItems, borderBottomColor: '#e3e3e3', borderBottomWidth: 1 }}>
        <Text style={{ flex: 1 }}>网络名称</Text>
        <TextInput style={{ flex: 3, padding: 0 }} value={name} onChangeText={e => setName(e)} />
      </View>
      <View style={{ ...mt1, ...rowItems, borderBottomColor: '#e3e3e3', borderBottomWidth: 1 }}>
        <Text style={{ flex: 1 }}>RPC</Text>
        <TextInput style={{ flex: 3, padding: 0 }} value={rpc} onChangeText={e => setRpc(e)} />
      </View>
      <View style={{ ...mt1, ...rowItems, borderBottomColor: '#e3e3e3', borderBottomWidth: 1 }}>
        <Text style={{ flex: 1 }}>chainId</Text>
        <TextInput style={{ flex: 3, padding: 0 }} value={chainId} onChangeText={e => setChainId(e)} />
      </View>
      <View style={{ ...mt1, ...rowItems, borderBottomColor: '#e3e3e3', borderBottomWidth: 1 }}>
        <Text style={{ flex: 1 }}>货币符号</Text>
        <TextInput style={{ flex: 3, padding: 0 }} value={symbol} onChangeText={e => setSymbol(e)} />
      </View>
      <View style={{ ...mt1, ...rowItems, borderBottomColor: '#e3e3e3', borderBottomWidth: 1 }}>
        <Text style={{ flex: 1 }}>区块链浏览器</Text>
        <TextInput style={{ flex: 3, padding: 0 }} value={browser} onChangeText={e => setBrowser(e)} />
      </View>
      <View style={{ ...mt3 }}>
        <Button onPress={saveNetwork}>保存</Button>
      </View>
    </View>
  )
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    add_network: (item: NetworkType) => addNetwork(dispatch, item)
  }
};

const mapStateToProps = (state: any) => {
  return {
    active_account: JSON.parse(state.activeAccount)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(AddNetwork);