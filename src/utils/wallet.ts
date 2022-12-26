import { BigNumber, Contract, ethers } from "ethers";
import Toast from "react-native-root-toast";
import { Token__factory } from "../contract/Token__factory";
import { AccountType, JsonRpcRequest, LsyWalletTransferRequest, SignerDataType } from "../interface";
import store from "../redux";
import { NFTListConstant, transferLog } from "../redux/constant/types";
import NFTAbi from '../contract/ERC721_ABI.json';

export const wei = {
  Zero: BigNumber.from(0),
  MaxUint256: BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
  MinInt256: BigNumber.from("-0x8000000000000000000000000000000000000000000000000000000000000000"),
  MaxInt256: BigNumber.from("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
  AddressZero: "0x0000000000000000000000000000000000000000",
}

export const splitAddress = (address: string, count?: number) => {
  let dec = count ? count : 7;
  return address.substring(0, dec) + '...' + address.substring(address.length - dec, address.length);
};

export const toBigNumber = (value: string, dec: number) => {
  return ethers.utils.parseUnits(value, dec);
}

export const fromBigNumber = (value: BigNumber, dec: number) => {
  return ethers.utils.formatUnits(value, dec);
};

export const thousands = (val: BigNumber, dec: number) => {
  let num = toBigNumber('10000000', dec);
  if (val.gte(num)) {
    let value = fromBigNumber(val.div('1000'), dec).toString();
    if (value.indexOf('.') > -1) {
      value = value = value.substring(0, value.indexOf('.') + 4)
    };
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return value + 'k';
  };
  let value = fromBigNumber(val, dec);
  if (value.indexOf('.') > -1) {
    value = value = value.substring(0, value.indexOf('.') + 4)
  };
  value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return value;
}

export const toFixed2 = (val: string, double: number) => {
  if (val.indexOf('.') > -1) {
    return val.substring(0, val.indexOf('.') + (double === 0 ? double : (double + 1)));
  };
  return val;
};

export const signeStringify = (obj: any) => {
  if (typeof obj !== 'object') return '';
  let str = '';
  for (let i in obj) {
    str += `${i}:${obj[i]}||`
  }
  return str;
};

export const signeParse = (value: string) => {
  let slice = value.split("||");
  let transaction: any = {};
  slice.filter((v) => v !== '').forEach((item: any) => {
    let arr = item.split(":");
    transaction[arr[0]] = arr[1];
  });
  return transaction;
};

// 创建钱包
const createWallet = async () => {
  let path = "m/44'/60'/0'/0/" + store.getState().pathReducer;
  let bytes = ethers.utils.randomBytes(16);
  let mnemonic = ethers.utils.entropyToMnemonic(bytes);
  let seed = ethers.utils.mnemonicToSeed(mnemonic);
  let hdWallet = ethers.utils.HDNode.fromSeed(seed);
  let wallet = hdWallet.derivePath(path);
  let params: AccountType = {
    address: wallet.address,
    accountName: 'default',
    privateKey: wallet.privateKey,
    publicKey: wallet.publicKey,
    words: mnemonic,
    pwd: ''
  }
  return params;
};

// 发送签名交易
export const sendSignerTransaction = async (msg: SignerDataType) => {
  try {
    let state = store.getState();
    let active_network = JSON.parse(state.activeNetwork);
    let provider = new ethers.providers.JsonRpcProvider(active_network.rpc);
    let tx = await provider.sendTransaction(msg.signData);
    Toast.show('交易 发送完成');
    store.dispatch({
      type: transferLog.ADD,
      item: {
        contractAddress: msg.contractAddress,
        isStatus: 0,
        hash: tx.hash,
        rpc: active_network.rpc,
        walletAddress: msg.walletAddress,
        createTime: new Date().getTime(),
        decimals: msg.decimals
      }
    });
    let tx1 = await tx.wait();
    if (tx1.status === 1) {
      store.dispatch({
        type: transferLog.UPDATE,
        item: {
          hash: tx1.transactionHash,
          isStatus: 1
        }
      });
      Toast.show('交易完成');
    } else {
      store.dispatch({
        type: transferLog.UPDATE,
        item: {
          hash: tx1.transactionHash,
          isStatus: 2
        }
      });
      Toast.show('交易失败');
    }
  }
  catch (error) {
    throw error;
  }

};

// 转账代币 
export const transferToken = async (msg: LsyWalletTransferRequest) => {
  try {
    let state = store.getState();
    let active_network = JSON.parse(state.activeNetwork);
    let active_account = JSON.parse(state.activeAccount);
    let provider = new ethers.providers.JsonRpcProvider(active_network.rpc);
    let wallet = new ethers.Wallet(active_account.privateKey);
    let sign = wallet.connect(provider);
    let _contract = Token__factory.connect(msg.contractAddress, sign);
    let tx = await _contract.transfer(msg.data.to, msg.data.value, {
      gasLimit: msg.data.gasLimit,
      gasPrice: msg.data.gasPrice,
      nonce: msg.data.nonce
    });
    Toast.show('交易发送完成');
    store.dispatch({
      type: transferLog.ADD,
      item: {
        contractAddress: msg.contractAddress,
        isStatus: 0,
        hash: tx.hash,
        rpc: active_network.rpc,
        walletAddress: active_account.address,
        createTime: new Date().getTime(),
        decimals: msg.decimals
      }
    });
    let tx1 = await tx.wait();
    if (tx1.status === 1) {
      store.dispatch({
        type: transferLog.UPDATE,
        item: {
          hash: tx1.transactionHash,
          isStatus: 1
        }
      });
      Toast.show('交易完成');
    } else {
      store.dispatch({
        type: transferLog.UPDATE,
        item: {
          hash: tx1.transactionHash,
          isStatus: 2
        }
      });
      Toast.show('交易失败');
    }
  } catch (error) {
    console.log(error);

    Toast.show(`${error}`)
  }
};

// 转账主币 isStatus: 0-确认中   1 - 完成  2 - 失败
export const transferMainToken = async (msg: LsyWalletTransferRequest) => {
  try {
    let state = store.getState();
    let active_network = JSON.parse(state.activeNetwork);
    let active_account = JSON.parse(state.activeAccount);
    let provider = new ethers.providers.JsonRpcProvider(active_network.rpc);
    let wallet = new ethers.Wallet(active_account.privateKey, provider);
    let tx = await wallet.sendTransaction(msg.data);
    Toast.show('交易发送完成');
    store.dispatch({
      type: transferLog.ADD,
      item: {
        contractAddress: msg.contractAddress,
        isStatus: 0,
        hash: tx.hash,
        rpc: active_network.rpc,
        walletAddress: active_account.address,
        createTime: new Date().getTime(),
        decimals: msg.decimals
      }
    });
    let tx1 = await tx.wait();
    if (tx1.status === 1) {
      store.dispatch({
        type: transferLog.UPDATE,
        item: {
          hash: tx1.transactionHash,
          isStatus: 1
        }
      });
      Toast.show('交易完成');
    } else {
      store.dispatch({
        type: transferLog.UPDATE,
        item: {
          hash: tx1.transactionHash,
          isStatus: 2
        }
      });
      Toast.show('交易失败');
    }
  } catch (error) {
    Toast.show(`${error}`);
  }
};

// NFT 转账
export const transferNFT = async (msg: LsyWalletTransferRequest) => {
  try {
    let state = store.getState();
    let active_network = JSON.parse(state.activeNetwork);
    let provider = new ethers.providers.JsonRpcProvider(active_network.rpc);
    let tx = await provider.sendTransaction(msg.data.signData);
    Toast.show('交易发送完成');
    let { status } = await tx.wait();
    if (status === 1) {
      Toast.show('交易成功');
      let params = { ...msg.data.nftItem };
      let _contract = new Contract(params.contract, NFTAbi, provider);
      let balance = await _contract.balanceOf(params.account);
      params.balance = balance.toNumber();
      store.dispatch({
        type: NFTListConstant.UPDATE_ITEM,
        item: params
      });
    } else {
      Toast.show('交易失败');
    }
  } catch (error) {
    console.log(error);
    Toast.show(`${error}`, {
      duration: 3000
    })
  }
};

export const eth_call = async (payload: JsonRpcRequest | any) => {
  let state = store.getState();
  let active_network = JSON.parse(state.activeNetwork);
  let res = await (
    await fetch(active_network.rpc, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: payload.method,
        params: payload.params
      }),
    })
  ).json();
  if (res.result) return res.result;
  return res;
}