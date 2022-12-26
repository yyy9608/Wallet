import { View, Text, TextInput, Alert, ActivityIndicator, Keyboard } from 'react-native';
import { useState } from 'react';
import { globalStyle } from '../../styles';
import { Button } from '@rneui/themed';
import { _abi } from '../../contract/abi';
import { ethers } from 'ethers';
import { Contract, Provider } from 'ethers-multicall';
import { connect } from 'react-redux';
import { MyStyleSheet } from '../../utils/MyStyleSheet';
import { TokenType } from '../../interface';
import { addToken } from '../../redux/action/tokenAction';
const { mt1, plr1, columnBetween, rowCenter, row, alignItems, mt2, mtb1, rowBetween, mb1 } = globalStyle;

// 0x2170Ed0880ac9A755fd29B2688956BD959F933F8

const AddToken = ({ active_network, active_account, add_token, navigation }: any) => {

  const [tokenAddress, setTokenAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [decimals, setDecimals] = useState(0);
  const [btcSymbol, setBtcSymbol] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  const getTokenInfo = async (value: string) => {
    try {
      setTokenAddress(value);
      if (value.length >= 42) {
        setLoading(true);
        let provider = new ethers.providers.JsonRpcProvider(active_network.rpc);
        await provider.getCode(value);
        Keyboard.dismiss();
        let _contract = new Contract(value, _abi);
        let _provider = new Provider(provider, active_network.chainID);
        let name = _contract.name();
        let decimals = _contract.decimals();
        let symbol = _contract.symbol();
        let res = await _provider.all([name, decimals, symbol]);
        setLoading(false);
        setShowInfo(true);
        setName(res[0]);
        setDecimals(res[1]);
        setBtcSymbol(res[2]);
      } else {
        setShowInfo(false);
      }
    } catch (error) {
      setLoading(false);
      setShowInfo(false);
      Alert.alert(`${error}`)
    }
  };

  const confirmAddToken = () => {
    if (!showInfo) return;
    let params: TokenType = {
      contractAddress: tokenAddress,
      contractName: name,
      decimals: decimals,
      symbol: btcSymbol,
      rpc: active_network.rpc,
      walletAddress: active_account.address
    };
    add_token(params);
    navigation.goBack();
  };

  return (
    <View style={[mt1, plr1, columnBetween]}>
      <View style={{ height: '85%', }}>
        <Text>代币合约地址</Text>
        <TextInput value={tokenAddress} onChangeText={e => getTokenInfo(e)} style={{ backgroundColor: '#e8e8e8', ...mt1 }} placeholder="输入代币合约地址" />
        {
          loading
            ?
            <View style={{ ...mt1 }}>
              <ActivityIndicator size="large" color="blue" animating={true} />
            </View>
            :
            showInfo
            &&
            <View style={{ ...myStyle.tokenBox, ...mt1 }}>
              <View style={{ ...rowCenter }}>
                <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: 'blue', ...mt1 }}></View>
              </View>
              <View style={{ ...plr1, ...row, flexWrap: 'wrap', ...alignItems, ...mt2 }}>
                <Text style={{ flex: 2 }}>合约地址：</Text>
                <Text style={{ flex: 6 }}>{tokenAddress}</Text>
              </View>
              <View style={{ width: '100%', height: 1, backgroundColor: 'blue', ...mtb1 }}></View>
              <View style={{ ...rowBetween, ...plr1 }}>
                <Text>代币</Text>
                <Text>{name}</Text>
              </View>
              <View style={{ width: '100%', height: 1, backgroundColor: 'blue', ...mtb1 }}></View>
              <View style={{ ...rowBetween, ...plr1 }}>
                <Text>代币符号</Text>
                <Text>{btcSymbol}</Text>
              </View>
              <View style={{ width: '100%', height: 1, backgroundColor: 'blue', ...mtb1 }}></View>
              <View style={{ ...rowBetween, ...plr1, ...mb1 }}>
                <Text>代币精度(小数点)</Text>
                <Text>{decimals}</Text>
              </View>
            </View>
        }
      </View>
      <View style={{}}>
        <Button title="添加代币" onPress={confirmAddToken}></Button>
      </View>
    </View>
  )
};

const myStyle = MyStyleSheet.create({
  tokenBox: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'blue',
    borderRadius: 10
  }
})

const mapStateToProps = (state: any) => {
  return {
    active_network: JSON.parse(state.activeNetwork),
    active_account: JSON.parse(state.activeAccount)
  }
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    add_token: (item: TokenType) => addToken(dispatch, item)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(AddToken);