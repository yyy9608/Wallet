import { View, Text } from 'react-native';
import { globalStyle } from '../../styles';
import QRCode from 'react-native-qrcode-svg';
import { connect } from 'react-redux';
import { Button } from '@rneui/themed';
import Clipboard from '@react-native-clipboard/clipboard';
const { column, mt1, plr1, rowCenter, p1, tac, mt2, fz16, mt3 } = globalStyle;

const CollecMmoney = ({ address }: any) => {
  return (
    <View style={{ ...column, ...plr1, height: '100%', backgroundColor: 'blue' }}>
      <View style={{ ...mt1, width: '100%', height: '70%', backgroundColor: '#fff', borderRadius: 20, ...p1 }}>
        <View style={{ width: '100%', ...p1, ...mt1, backgroundColor: '#FDF8EB', borderColor: '#F7E00A', borderWidth: 1 }}>
          <Text style={{ color: '#f7800a', ...tac }}>仅向该地址转入ETH/ERC20相关的资产</Text>
        </View>
        <View style={{ ...rowCenter, ...mt1 }} >
          <QRCode
            value={address}
            logoBorderRadius={1}
            color={'#191919'}
            backgroundColor={'#ffffff'}
            size={150}
          />
        </View>
        <View style={{ ...mt2 }}>
          <Text style={{ ...tac, ...fz16 }}>收款地址</Text>
          <Text style={tac}>{address}</Text>
        </View>
        <View style={mt3}>
          <Button onPress={() => {
            Clipboard.setString(address);
          }}>复制地址</Button>
        </View>
      </View>
    </View >
  )
};

const mapStateToProps = (state: any) => {
  return {
    address: JSON.parse(state.activeAccount).address
  }
};

export default connect(mapStateToProps)(CollecMmoney);