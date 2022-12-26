import { useEffect, useState } from "react";
import { ScrollView, Text, View, Dimensions, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { BigNumber, ethers } from "ethers";
import { Provider, Contract } from 'ethers-multicall';
import { connect } from "react-redux";
import NFTAbi from '../../contract/ERC721_ABI.json';
import { globalStyle } from "../../styles";
import { splitAddress } from "../../utils/wallet";
import Clipboard from '@react-native-clipboard/clipboard';

const { p1, rowItems, ml1, fz16, mt1, ml5px, rowBetween, columnBetween, rowCenter } = globalStyle;
const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

const MineNFTList = ({ route, active_network, navigation, nftList }: any) => {

  const [nftIndexList, setNftIndexList] = useState([] as any);
  let [loading, setLoading] = useState(false);
  let [refreshing, setRefreshing] = useState(false);
  let [current] = useState(nftList.findIndex((v: any) => v.contract === route.params.contract));

  const getNftIndex = async (balance?: number) => {
    let length = balance ? balance : route.params.balance;
    if (!refreshing) {
      setLoading(true);
    };
    let rqsList = [];
    let rpc = new ethers.providers.JsonRpcProvider(active_network.rpc);
    let _provider = new Provider(rpc, active_network.chainID);
    let _contract = new Contract(route.params.contract, NFTAbi);
    for (let i = 0; i < length; i++) {
      rqsList.push(_contract.tokenOfOwnerByIndex(route.params.account, i));
    };
    let res = await _provider.all(rqsList);
    setNftIndexList(res);
    setLoading(false);
    setRefreshing(false);
  };

  // 刷新
  const onRefresh = () => {
    setNftIndexList([]);
    refreshing = true;
    setRefreshing(true);
    getNftIndex();
  };

  useEffect(() => {
    getNftIndex(nftList[current].balance);
  }, [nftList[current].balance]);

  return (
    <View style={{ ...columnBetween }}>
      <View style={{ backgroundColor: '#fff', ...p1, ...rowItems }}>
        <View style={{ width: 60, height: 60, backgroundColor: 'blue', borderRadius: 30 }}></View>
        <View style={{ ...ml1 }}>
          <Text style={{ ...fz16 }}>{route.params.name}</Text>
          <View style={{ ...rowItems, ...mt1 }}>
            <View style={{ borderColor: '#e8e8e8', borderWidth: 1 }}>
              <Text style={{ color: 'grey' }}>ERC721</Text>
            </View>
            <Text style={{ ...ml1 }}>{splitAddress(route.params.contract, 8)}</Text>
            <Text style={{ ...ml5px, color: 'blue' }} onPress={() => Clipboard.setString(route.params.contract)}>复制</Text>
          </View>
        </View>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={{ backgroundColor: '#fff', ...p1, ...mt1, height: '100%' }}>
        <Text>资产</Text>
        {
          loading
            ?
            <View>
              <ActivityIndicator size="large" color="blue" />
            </View>
            :
            <View style={{ ...rowBetween, flexWrap: 'wrap' }}>
              {
                nftIndexList.map((item: BigNumber) => {
                  return (
                    <TouchableOpacity onPress={() => navigation.navigate('NFTTransfer', { tokenId: item, ...route.params })} style={{ width: '48%', height: 200, borderColor: 'blue', borderWidth: 1, ...mt1, ...rowCenter, borderRadius: 10 }} key={item.toNumber()}>
                      <Text>#{item.toNumber()}</Text>
                    </TouchableOpacity>
                  )
                })
              }
            </View>
        }
        <View style={{ height: deviceHeight / 100 * 20 }}></View>
      </ScrollView>
    </View >
  )
};

const mapStateToProps = (state: any) => {
  return {
    active_network: JSON.parse(state.activeNetwork),
    nftList: JSON.parse(state.nftListReducer)
  }
}

export default connect(mapStateToProps)(MineNFTList);