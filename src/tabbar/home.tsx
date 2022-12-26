import { ScrollView, StatusBar, Text, TouchableOpacity, View, SafeAreaView, RefreshControl, Dimensions, TextInput, Modal } from "react-native";
import React, { useState, useEffect } from 'react';
import { globalStyle } from "../styles";
import { connect } from 'react-redux';
import { AccountType, NFTListType, TokenType } from "../interface";
import { addAccount, updateAccount } from "../redux/action/accountAction";
import { fromBigNumber, splitAddress, toFixed2, wei } from "../utils/wallet";
import { BigNumber, ethers } from "ethers";
import { Provider, Contract } from 'ethers-multicall';
import { _abi } from "../contract/abi";
import NFTAbi from '../contract/ERC721_ABI.json';
import { BottomSheet, Button } from "@rneui/themed";
import Toast from "react-native-root-toast";
import { addNFTList, updateNFTList } from "../redux/action/nftListAction";
import VerifyPasswordModal from "../components/Verify-Password-Modal";
import { QRCodeScreen } from "../components/QRCode";

const { plr1, mt1, p1, row, rowBetween, mt3, ml5px, tac, alignItems, fz14, fz18, mt2, rowItems, mr2, columnBetween } = globalStyle;
const { width: deviceWidth, height: deviceHeight } = Dimensions.get("window");

const Home = ({ activeNetwork, activeAccount, tokenList, navigation, add_nft_list, nftList, update_nft_list }: any) => {

  const [currentIndex, setIndex] = useState(0);
  const [mainBTCBalance, setMainBTCBalance] = useState(wei.Zero);
  const [token, setToken] = useState(tokenList);
  const [refreshing, setRefreshing] = useState(false);
  const [addNFTVisible, setAddNFTVisible] = useState(false);
  const [nftContract, setNftContract] = useState('');
  const [nftInfo, setNftInfo] = useState<NFTListType | null>(null);
  const [verifyPwdVisible, setVerifyVisible] = useState(false);
  const [nftVisible, setNftVisible] = useState(false);

  // 获取主币余额
  const getMainBtcBalance = async () => {
    setMainBTCBalance(wei.Zero);
    let provider = new ethers.providers.JsonRpcProvider(activeNetwork.rpc);
    let balance = await provider.getBalance(activeAccount.address);
    setMainBTCBalance(balance);
    setRefreshing(false);
  };

  // 获取代币余额
  const getTokenBalance = async () => {
    setToken(tokenList);
    if (tokenList.length <= 0) return;
    let contract: any = [];
    let newTokenList: any = [];
    let rpc = new ethers.providers.JsonRpcProvider(activeNetwork.rpc);
    let _provider = new Provider(rpc, activeNetwork.chainID);
    tokenList.forEach((item: any) => {
      let _contract = new Contract(item.contractAddress, _abi);
      contract.push(_contract.balanceOf(item.walletAddress));
    });
    let res = await _provider.all(contract);
    tokenList.forEach((item: TokenType, index: number) => {
      newTokenList.push({
        ...item,
        balance: res[index]
      });
    });
    setToken(newTokenList)
  };

  // 刷新
  const onRefresh = () => {
    setRefreshing(true);
    getMainBtcBalance();
    getTokenBalance();
  };

  // 获取NFTinfo
  const getNFTInfo = async () => {
    try {
      let rpc = new ethers.providers.JsonRpcProvider(activeNetwork.rpc);
      let _provider = new Provider(rpc, activeNetwork.chainID);
      let _contract = new Contract(nftContract, NFTAbi);
      let nameRqs = _contract.name();
      let balanceRqs = _contract.balanceOf(activeAccount.address);
      let [name, balance] = await _provider.all([nameRqs, balanceRqs]);
      setNftInfo({
        balance: balance.toNumber(),
        name: name,
        contract: _contract.address,
        account: activeAccount.address,
        chainId: activeNetwork.chainID
      });
    } catch (error) {
      Toast.show('invalid address');
      setAddNFTVisible(false);
      setNftContract('');
      setNftInfo(null);
    }
  };

  // 添加NFT
  const handleAddNFTList = async () => {
    if (!nftInfo) return;
    add_nft_list(nftInfo);
    setAddNFTVisible(false);
  };

  // 更新NFT balance
  const handleUpdateNftListBalance = async () => {
    try {
      let rpc = new ethers.providers.JsonRpcProvider(activeNetwork.rpc);
      let _provider = new Provider(rpc, activeNetwork.chainID);
      let rqsList: any = [];
      nftList.forEach((item: NFTListType) => {
        let _contract = new Contract(item.contract, NFTAbi);
        rqsList.push(_contract.balanceOf(activeAccount.address));
      });
      if (rqsList.length <= 0) return;
      let res = await _provider.all(rqsList);
      update_nft_list(res);
    } catch (error) {

    }
  };

  // 扫描NFT地址 回调
  const nftAddressScannerCallback = (value: string) => {
    setNftVisible(false);
    setNftContract(value);
  };

  // 接收币
  const receiveBTC = (bool?: Boolean) => {
    if (activeAccount.backup) {
      !bool && setVerifyVisible(true);
      bool && navigation.navigate('MnemonicList');
      return;
    };
    navigation.navigate('CollecMmoney')
  };

  useEffect(() => {
    getMainBtcBalance();
  }, [activeAccount.address, activeNetwork.rpc]);

  useEffect(() => {
    getTokenBalance();
  }, [activeAccount.address, activeNetwork.rpc, tokenList]);

  // 监听nft合约输入
  useEffect(() => {
    if (nftContract.length < 42) return;
    getNFTInfo();
  }, [nftContract]);

  useEffect(() => {
    if (addNFTVisible) return;
    setNftInfo(null);
    setNftContract('');
  }, [addNFTVisible]);


  // 更新NFTList
  useEffect(() => {
    if (currentIndex === 1) {
      handleUpdateNftListBalance();
    };
  }, [currentIndex]);

  return (
    <SafeAreaView>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <StatusBar backgroundColor="rgba(0,0,0,.45)" />
        {/*  */}
        <View style={{ ...plr1, ...mt1 }}>
          <View style={{ width: '100%', ...p1, backgroundColor: 'blue' }}>
            <View style={{ ...row, ...rowBetween }}>
              <Text style={{ color: '#fff' }}>{activeNetwork.name}</Text>
              <Text style={{ color: '#fff' }} >详情</Text>
            </View>
            <View style={{ ...mt3, ...rowBetween, alignItems: 'flex-end' }}>
              <Text style={{ color: '#fff' }}>{activeAccount.address && splitAddress(activeAccount.address)}</Text>
              <Text style={{ color: '#fff', ...fz18 }}>{toFixed2(fromBigNumber(mainBTCBalance, 18), 4)} {activeNetwork.symbol}</Text>
            </View>
          </View>
          <View style={{ width: '100%', ...p1, backgroundColor: '#fff', ...row }} >
            <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('Transfer')}>
              <Text style={{ ...tac }}>转账</Text>
            </TouchableOpacity>
            <Text style={{ width: 1, height: 20, backgroundColor: '#e8e8e8' }}></Text>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => receiveBTC()}>
              <Text style={{ ...tac }}>收款</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/*  */}
        <View style={{ ...rowBetween, ...mt1, ...plr1 }}>
          <View style={{ ...row }}>
            <Text style={{ ...mr2, color: currentIndex === 0 ? 'blue' : 'black', borderBottomColor: currentIndex === 0 ? 'blue' : '', borderBottomWidth: currentIndex === 0 ? 2 : 0 }} onPress={() => setIndex(0)} >代币</Text>
            <Text style={{ color: currentIndex === 1 ? 'blue' : 'black', borderBottomColor: currentIndex === 1 ? 'blue' : '', borderBottomWidth: currentIndex === 1 ? 2 : 0 }} onPress={() => setIndex(1)}>NFT</Text>
          </View>
          <Text style={{ color: 'blue' }} onPress={() => setAddNFTVisible(true)}>导入NFT</Text>
        </View>
        {
          currentIndex === 0
          &&
          <TokenListWidget navigation={navigation} mainBTCBalance={mainBTCBalance} activeNetwork={activeNetwork} token={token} />
        }
        {
          currentIndex === 1
          &&
          <NFTList list={nftList} navigation={navigation} />
        }
      </ScrollView>
      {/* 添加NFT */}
      <BottomSheet isVisible={addNFTVisible} onBackdropPress={() => setAddNFTVisible(false)}>
        <View style={{ width: '100%', height: deviceHeight / 2, backgroundColor: '#fff', ...columnBetween }}>
          <View style={{ ...p1 }}>
            <Text style={{ ...tac, color: 'blue', ...fz18 }}>添加NFT</Text>
            <View style={{ width: '100%', height: 1, backgroundColor: '#e8e8e8', ...mt1, }}></View>
            <View style={{ ...rowBetween, backgroundColor: '#e8e8e8', ...mt1, ...p1, ...alignItems }}>
              <TextInput placeholder="请输入NFT合约地址" style={{ width: '80%' }} value={nftContract} onChangeText={e => setNftContract(e)} />
              <Text style={{ color: 'blue' }} onPress={() => setNftVisible(true)}>扫一扫</Text>
            </View>
            {
              nftInfo
              &&
              <View style={{ ...mt2, ...rowBetween }}>
                <View style={{ ...rowItems }}>
                  <View style={{ width: 30, height: 30, backgroundColor: 'blue', borderRadius: 15 }}></View>
                  <Text style={{ ...ml5px }}>{nftInfo.name}</Text>
                </View>
                <Text>{nftInfo.balance}</Text>
              </View>
            }
          </View>
          <Button title="添加" onPress={handleAddNFTList} />
        </View>
      </BottomSheet>
      {/* 扫描NFT地址 */}
      <Modal visible={nftVisible} animationType='slide'>
        <QRCodeScreen goBack={setNftVisible} cb={nftAddressScannerCallback} />
      </Modal>
      {/* 验证密码 */}
      {verifyPwdVisible && <VerifyPasswordModal visible={verifyPwdVisible} setVisible={setVerifyVisible} cb={receiveBTC} />}
    </SafeAreaView>
  )
};

const NFTList = ({ list, navigation }: any) => {
  return (
    <View style={{ ...plr1 }}>
      {
        list.map((item: NFTListType) => {
          return (
            <TouchableOpacity onPress={() => navigation.navigate('MineNFTList', item)} key={Number(item.chainId)}>
              <View style={{ ...rowBetween, ...mt2, ...alignItems }}>
                <View style={{ ...rowItems }}>
                  <View style={{ width: 24, height: 24, backgroundColor: `green`, borderRadius: 15 }}></View>
                  <Text style={{ ...fz14, color: '#000', ...ml5px }}>{item.name}</Text>
                </View>
                <Text>{item.balance}</Text>
              </View>
              <View style={{ width: '100%', height: 1, backgroundColor: '#e8e8e8', ...mt2 }} ></View>
            </TouchableOpacity>
          )
        })
      }
    </View>
  )
};

// 0xa82275f7d047075ff0acc68468d98e68a7f6fa43 NFT

const TokenListWidget = ({ navigation, mainBTCBalance, activeNetwork, token }: any) => {
  return (
    <View style={{ ...plr1 }}>
      <TouchableOpacity onPress={() => navigation.navigate('TokenDetail', {
        balance: mainBTCBalance,
        decimals: 18,
        symbol: activeNetwork.symbol,
        contractAddress: ''
      })}>
        <View style={{ ...rowBetween, ...mt2, ...alignItems }}>
          <View style={{ ...rowItems }}>
            <View style={{ width: 24, height: 24, backgroundColor: `green`, borderRadius: 15 }}></View>
            <Text style={{ ...fz14, color: '#000', ...ml5px }}>{activeNetwork.symbol}</Text>
          </View>
          <Text>{toFixed2(fromBigNumber(mainBTCBalance, 18), 4)}</Text>
        </View>
        <View style={{ width: '100%', height: 1, backgroundColor: '#e8e8e8', ...mt2 }}></View>
      </TouchableOpacity>
      {
        token.map((item: any, index: number) => {
          return (
            <TouchableOpacity onPress={() => navigation.navigate('TokenDetail', item)} key={index}>
              <View style={{ ...rowBetween, ...mt2, ...alignItems }}>
                <View style={{ ...rowItems }}>
                  <View style={{ width: 24, height: 24, backgroundColor: `blue`, borderRadius: 15 }}></View>
                  <Text style={{ ...fz14, color: '#000', ...ml5px }}>{item.symbol}</Text>
                </View>
                <Text>{item.balance ? toFixed2(fromBigNumber(item.balance, item.decimals), 4) : 0}</Text>
              </View>
              <View style={{ width: '100%', height: 1, backgroundColor: '#e8e8e8', ...mt2 }}></View>
            </TouchableOpacity>
          )
        })
      }
    </View>
  )
};

// 筛选当前地址和rpc下的代币
const filterToken = (state: any) => {
  let newTokenList: Array<TokenType> = [];
  let activeNetwork = JSON.parse(state.activeNetwork);
  let activeAccount = JSON.parse(state.activeAccount);
  let tokenList = JSON.parse(state.tokenList);
  tokenList.forEach((item: TokenType) => {
    if (item.walletAddress === activeAccount.address && item.rpc === activeNetwork.rpc) {
      newTokenList.push(item);
    }
  });
  return newTokenList;
};

// 筛选当前地址和rpc下的NFT
const filterNFTList = (state: any) => {
  let newNFTList: Array<NFTListType> = [];
  let activeNetwork = JSON.parse(state.activeNetwork);
  let activeAccount = JSON.parse(state.activeAccount);
  let nftList = JSON.parse(state.nftListReducer);
  nftList.forEach((item: NFTListType) => {
    if (item.account === activeAccount.address && item.chainId === activeNetwork.chainID) {
      newNFTList.push(item);
    }
  });
  return newNFTList;
};

const mapStateToProps = (state: any) => {
  return {
    activeNetwork: JSON.parse(state.activeNetwork),
    accountList: JSON.parse(state.accountList),
    activeAccount: JSON.parse(state.activeAccount),
    tokenList: filterToken(state),
    nftList: filterNFTList(state)
  }
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    update_activeAccount: (item: AccountType) => updateAccount(dispatch, item),
    add_account: (item: AccountType) => addAccount(dispatch, item),
    add_nft_list: (item: NFTListType) => addNFTList(dispatch, item),
    update_nft_list: (item: Array<BigNumber>) => updateNFTList(dispatch, item)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);