import { View, Text, ScrollView, Image } from 'react-native';
import { connect } from 'react-redux';
import { globalStyle } from '../../styles';
import { getTime } from '../../utils';
import { fromBigNumber, splitAddress, toBigNumber, toFixed2, wei } from '../../utils/wallet';
import Clipboard from '@react-native-clipboard/clipboard';
import { Button } from '@rneui/themed';
import InputDataDecoder from '../../utils/decoder';


const { p1, rowCenter, fz16, tac, mt1, mt2, ml5px, mt5px, rowItems, ml1, fz12 } = globalStyle;

const TransferDetail = ({ route, active_netwrok, navigation }: any) => {

  const isMainToken = (item: any) => {
    if (item.value.gt('0')) {
      return '-' + fromBigNumber(item.value, item.decimals);
    };
    let decoder = new InputDataDecoder();
    let inputData = decoder.decodeData(item.data);
    if (inputData && inputData.inputs.length >= 2) {
      if (inputData.inputs[1].eq(wei.MaxUint256)) {
        return '无限数量'
      }
      return '-' + fromBigNumber(inputData.inputs[1], item.decimals)
    };
    return '-0';
  };

  const isApprove = (item: any) => {
    let decoder = new InputDataDecoder();
    let inputData: any = decoder.decodeData(item.data);
    return inputData.method;
  };

  return (
    <ScrollView style={{ ...p1 }}>
      <View style={{ ...p1, width: '100%', backgroundColor: '#fff', borderRadius: 20 }}>
        <View style={{ ...rowCenter }}>
          <View style={{ width: 50, height: 50, backgroundColor: '#009ad6', borderRadius: 25, ...rowCenter }}>
            {isApprove(route.params) === 'approve' && <Text style={{ color: '#f3704b' }}>授权</Text>}
          </View>
        </View>
        {
          isApprove(route.params) === 'approve'
            ?
            <Text style={{ color: route.params.isStatus === 2 ? 'red' : '#009ad6', ...tac, ...fz16, ...mt1 }}>{route.params.isStatus === 0 ? '确认中' : route.params.isStatus === 1 ? '授权成功' : '授权失败'}</Text>
            :
            <Text style={{ color: route.params.isStatus === 2 ? 'red' : '#009ad6', ...tac, ...fz16, ...mt1 }}>{route.params.isStatus === 0 ? '确认中' : route.params.isStatus === 1 ? '转账成功' : '转账失败'}</Text>
        }
        <View style={{ ...rowCenter, ...mt2 }}>
          <Text style={{ color: '#000', ...fz16 }}>{isMainToken(route.params)}</Text>
          <Text style={{ color: '#000', ...fz16, ...ml5px }}>{route.params.symbol}</Text>
        </View>
        <View style={mt2}>
          <Text>发款方</Text>
          <View style={rowItems}>
            <Text style={{ color: '#000', ...mt5px }}>{splitAddress(route.params.from, 16)}</Text>
            <Text style={{ color: 'blue', ...ml1, ...fz12 }} onPress={() => Clipboard.setString(route.params.from)}>复制</Text>
          </View>
        </View>
        <View style={mt2}>
          <Text>收款方</Text>
          <View style={rowItems}>
            <Text style={{ color: '#000', ...mt5px }}>{splitAddress(route.params.to, 16)}</Text>
            <Text style={{ color: 'blue', ...ml1, ...fz12 }} onPress={() => Clipboard.setString(route.params.to)}>复制</Text>
          </View>
        </View>
        <View style={mt2}>
          <Text>矿工费用</Text>
          <Text style={{ color: '#000', ...mt5px }}>{toFixed2((Number(fromBigNumber(route.params.gasPrice, 9)) * Number(route.params.gasLimit) / 1000000000).toString(), 8)} {active_netwrok.symbol}</Text>
        </View>
        <View style={{ width: '100%', height: 1, backgroundColor: '#e8e8e8', ...mt2 }}></View>
        <View style={mt2}>
          <Text>哈希值</Text>
          <View style={rowItems}>
            <Text style={{ color: '#000', ...mt5px }}>{splitAddress(route.params.hash, 16)}</Text>
            <Text style={{ color: 'blue', ...ml1, ...fz12 }} onPress={() => Clipboard.setString(route.params.hash)}>复制</Text>
          </View>
        </View>
        <View style={mt2}>
          <Text>区块号</Text>
          <View style={rowItems}>
            <Text style={{ color: '#000', ...mt5px }}>{route.params.blockNumber}</Text>
            <Text style={{ color: 'blue', ...ml1, ...fz12 }} onPress={() => Clipboard.setString(route.params.blockNumber)}>复制</Text>
          </View>
        </View>
        <View style={mt2}>
          <Text>交易时间</Text>
          <Text style={{ color: '#000', ...mt5px }}>{getTime(route.params.createTime)}</Text>
        </View>
      </View>
      <View style={mt2}>
        <Button title="打开区块链浏览器" onPress={() => navigation.navigate('ChainBrowser', { hash: route.params.hash })} />
      </View>
    </ScrollView >
  )
};

const mapStateToProps = (state: any) => {
  return {
    active_netwrok: JSON.parse(state.activeNetwork)
  }
};

export default connect(mapStateToProps)(TransferDetail);