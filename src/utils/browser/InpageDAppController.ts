import '@ethersproject/shims';
import { BigNumber, ethers } from "ethers";
import EventEmitter from "events";
import { NumberProp } from 'react-native-svg';
import { Token__factory } from '../../contract/Token__factory';
import { AddEthereumChainParameter, Payload, TokenType, TransferRequestParamsType, WatchAssetParams } from "../../interface";
import $store from "../../redux";
import { network, token, transferLog } from '../../redux/constant/types';
import { fromBigNumber, toBigNumber, toFixed2, wei } from '../wallet';
import MessageKeys from "./MessageKeys";
import { NetworkType } from '../../interface';
import Toast from 'react-native-root-toast';
import { Alert } from 'react-native';
import { IERC20__factory } from '../../contract/IERC20__factory';
import InputDataDecoder from '../decoder';

export const NOTIFICATION_NAMES = {
  accountsChanged: 'metamask_accountsChanged',
  unlockStateChanged: 'metamask_unlockStateChanged',
  chainChanged: 'metamask_chainChanged',
};



const Code_UserRejected = 4001;
const Code_InvalidParams = -32602;

export class InpageDappController extends EventEmitter {
  constructor() {
    super();
  }

  async handle(origin: string, payload: Payload, connect?: Boolean) {
    const { method, params, id, jsonrpc } = payload;
    let store = $store.getState();
    let activeAccount = JSON.parse(store.activeAccount);
    let activeNetwork = JSON.parse(store.activeNetwork);
    let result: any = null;

    switch (method) {
      case 'metamask_getProviderState':
        result = {
          isInitialized: true,
          isUnlocked: true,
          networkVersion: activeNetwork.chainID,
          chainId: BigNumber.from(activeNetwork.chainID)._hex,
          network: Number(activeNetwork.chainID),
          selectedAddress: activeAccount.address,
          accounts: activeAccount.address ? [activeAccount.address] : [],
        };
        break;
      case 'web3_clientVersion':
        result = `LSYWallet/v1.0.0`;
        break;
      case 'eth_accounts':
        result = activeAccount.address ? [activeAccount.address] : [];
        break;
      case 'eth_coinbase':
        result = null;
        break;
      case 'net_version':
        result = activeNetwork.chainID
        break;
      case 'eth_chainId':
        result = BigNumber.from(activeNetwork.chainID)._hex;
        break;
      case 'eth_requestAccounts':
        // result = activeAccount.address ? [activeAccount.address] : [];
        result = await this.eth_requestAccounts(origin, payload, connect);
        break;
      case 'wallet_switchEthereumChain':
        result = await this.wallet_switchEthereumChain(payload);
        break;
      case 'wallet_addEthereumChain': // 
        result = await this.wallet_addEthereumChain(params, payload);
        break;
      case 'wallet_watchAsset': //添加代币
        result = await this.wallet_watchAsset(origin, params);
        break;
      case 'eth_sign':
      case 'personal_sign':
        result = await this.sign(origin, payload);
        // case 'eth_signTypedData':
        // case 'eth_signTypedData_v3':
        // case 'eth_signTypedData_v4':
        break;
      // case 'eth_blockNumber':
      //   break;
      // case 'eth_estimateGas':
      //   break;
      case 'eth_sendTransaction':
        result = await this.eth_sendTransaction(payload);
        break;
      // case 'eth_getTransactionByHash':
      //   break;
      case 'eth_call':
        result = await this.eth_call(payload);
        break;
      default:
        if (method === 'eth_estimateGas' || method === 'eth_blockNumber') {
          result = '0x0';
        } else {
          result = await this.eth_call(payload);
        };
        break;
    };

    return {
      name: 'metamask-provider',
      data: { id, jsonrpc, error: typeof result.error === 'object' ? result.error : undefined, result },
    };
  };

  private async eth_call(payload: Payload | any) {
    let store = $store.getState();
    let active_network = JSON.parse(store.activeNetwork);
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
  /**
   * {
   * inputs:[],
   * method:[],
   * names:[],
   * types:[],
   * gasLimit,
   * gasPrice,
   * nonce,
   * decimals,
   * contractSymbol
   * }
   */
  private async eth_sendTransaction(payload: Payload) {

    let decoder = new InputDataDecoder();
    let inputData = decoder.decodeData(payload.params[0].data);
    let result: any = await this.getTransferParams(payload.params);

    if (result.error || !result) return result;

    return new Promise(async (resolve) => {
      const approve = async () => {
        let txHash = await this.sendTransaction(payload.params, result);
        if (!txHash) return { error: { code: Code_InvalidParams, message: '交易失败' } };
        resolve(txHash);
      };

      const reject = () => {
        Toast.show('用户拒绝');
        resolve({ error: { code: Code_UserRejected, message: '用户拒绝' } })
      }

      this.emit(MessageKeys.openTransferModal, {
        approve,
        reject,
        inputData,
        result,
        ...payload
      })
    })


  };

  private async eth_requestAccounts(origin: string, params: Payload, connect?: Boolean) {

    if (connect) {
      let store = $store.getState();
      let active_account = JSON.parse(store.activeAccount);
      return [active_account.address];
    };
    return new Promise((resolve) => {
      const approve = (account: Array<string>) => {
        Toast.show('授权成功');
        resolve(account);
        this.emit('dappConnect');
      };
      const reject = () => {
        Toast.show('拒绝授权');
        resolve({ error: { code: Code_UserRejected, message: '拒绝授权' } })
      };
      this.emit(MessageKeys.openApproveLoginModal, { approve, reject, origin, ...params });
    });
  };

  // ADD Network 
  private async wallet_addEthereumChain(params: AddEthereumChainParameter, payload: Payload) {

    if (
      !Array.isArray(params) ||
      !params[0] ||
      !params[0].chainId ||
      !params[0].chainName ||
      !Array.isArray(params[0].rpcUrls) ||
      !params[0].rpcUrls[0] ||
      !params[0].nativeCurrency ||
      !params[0].nativeCurrency.name ||
      !params[0].nativeCurrency.symbol ||
      !params[0].nativeCurrency.decimals
    ) {
      Toast.show('无效请求');
      return { error: { code: Code_InvalidParams, message: '无效请求' } };
    };
    let store = $store.getState();
    let networkList = JSON.parse(store.networkList);
    let chainId = BigNumber.from(params[0].chainId).toString();

    let index = networkList.findIndex((v: NetworkType) => v.chainID === chainId);

    if (index > -1) {
      this.wallet_switchEthereumChain(payload);
      return;
    };

    return new Promise((resolve) => {

      const approve = () => {
        let chain: NetworkType = {
          rpc: params[0].rpcUrls[0],
          name: params[0].nativeCurrency.name,
          chainID: BigNumber.from(params[0].chainId).toString(),
          symbol: params[0].nativeCurrency.symbol,
          browser: params[0].blockExplorerUrls ? params[0].blockExplorerUrls[0] : '',
          decimals: params[0].nativeCurrency.decimals || 18,
          remove: false
        };

        $store.dispatch({
          type: network.ADD,
          item: chain
        })

        Toast.show('网络添加成功');
        resolve(true);
      };

      const reject = () => {
        Toast.show('拒绝添加网络');
        resolve({ error: { code: Code_UserRejected, message: '拒绝添加网络' } })
      };

      this.emit(MessageKeys.openAddNetworkModal, {
        approve,
        reject,
        ...payload
      });

    })

  };

  // ADD Token 
  private async wallet_watchAsset(origin: string, asset: WatchAssetParams) {
    if (!asset || !asset.options || !asset.options.address || asset.type !== 'ERC20') {
      Toast.show('无效请求');
      return { error: { code: Code_InvalidParams, message: '无效请求' } };
    };
    let store = $store.getState();
    let network = JSON.parse(store.activeNetwork);
    let account = JSON.parse(store.activeAccount);
    let provider = new ethers.providers.JsonRpcProvider(network.rpc);
    let _contract = Token__factory.connect(asset.options.address, provider);
    let balance = wei.Zero;
    let name = '';
    try {
      let [n, b] = await Promise.all([_contract.name(), _contract.balanceOf(account.address)]);
      balance = b;
      name = n;
    } catch (error) {
      return { error: { code: Code_InvalidParams, message: '无效地址' } };
    }

    return new Promise((resolve) => {

      const approve = () => {
        let tokenParams: TokenType = {
          contractAddress: asset.options.address,
          contractName: name,
          decimals: asset.options.decimals,
          symbol: asset.options.symbol,
          rpc: network.rpc,
          walletAddress: account.address,
          images: asset.options.image,
        }

        Toast.show('代币添加成功');

        $store.dispatch({
          type: token.ADD,
          item: tokenParams
        });

        resolve(true);
      };

      const reject = () => {
        resolve(false);
        Toast.show('用户拒绝');
      };

      this.emit(MessageKeys.openAppTokenModal, {
        approve,
        reject,
        ...asset,
        balance,
        name
      })
    })
  };

  // Sign Message
  private async sign(origin: string, params: Payload) {
    if (!params.params[0]) {
      Toast.show('无效请求');
      return { error: { code: Code_InvalidParams, message: '无效请求' } }
    }
    return new Promise((resolve) => {
      const approve = () => {
        let store = $store.getState();
        let activeAccount = JSON.parse(store.activeAccount);
        let wallet = new ethers.Wallet(activeAccount.privateKey);
        let buffer = new Buffer(params.params[0], 'hex');
        let signture = wallet.signMessage(buffer.toString('utf8'));
        Toast.show('签名成功');
        resolve(signture);
      }
      const reject = () => {
        resolve({ error: { code: Code_UserRejected, message: '拒绝授权' } });
        Toast.show('拒绝授权');
      };
      this.emit(MessageKeys.openApproveSignModal, { approve, reject, origin, ...params });
    })
  }

  // change network
  private async wallet_switchEthereumChain(payload: Payload) {
    if (!Array.isArray(payload.params) || !payload.params[0].chainId) {
      Toast.show('无效请求');
      return { error: { code: Code_InvalidParams, message: '无效请求' } }
    };
    let store = $store.getState();
    let networkList = JSON.parse(store.networkList);
    let activeNetwork = JSON.parse(store.activeNetwork);
    let chainId = BigNumber.from(payload.params[0].chainId).toString();
    let index = networkList.findIndex((v: any) => v.chainID === chainId);

    if (chainId === activeNetwork.chainID) return { error: { code: -1, message: '网络相同,无需切换' } };
    if (index < 0) {
      return { error: { code: 4902, message: 'LSYWallet 没有该节点' } };
    }
    return new Promise((resolve) => {
      const approve = () => {
        $store.dispatch({
          type: network.UPDATE,
          item: networkList[index]
        });
        this.setDAppChainId(payload.pageMetadata?.origin!, chainId);
        resolve(null);
      };

      const reject = () => {
        Toast.show('拒绝切换网络');
        resolve({ error: { code: Code_UserRejected, message: '拒绝切换网络' } })
      };

      this.emit(MessageKeys.openSwitchNetworkModal, {
        approve,
        reject,
        ...payload
      })

    })

  }

  // change DApp ChainID
  async setDAppChainId(origin: string, chainId: string) {
    this.emit(
      NOTIFICATION_NAMES.chainChanged,
      {
        origin,
        name: 'metamask-provider',
        data: {
          method: NOTIFICATION_NAMES.chainChanged,
          jsonrpc: '2.0',
          params: { chainId: `0x${Number(chainId).toString(16)}`, networkVersion: `${chainId}` },
        },
      },
    );
  }

  async setDAppAccount(origin: string, account: string) {

    this.emit(NOTIFICATION_NAMES.accountsChanged, {
      origin,
      name: 'metamask-provider',
      data: {
        method: NOTIFICATION_NAMES.accountsChanged,
        jsonrpc: '2.0',
        params: [account],
      },
    });
  }

  // sen Transaction
  private async sendTransaction(params: Array<any>, result: any) {
    return new Promise(async (resolve) => {
      try {
        let store = $store.getState();
        let active_network = JSON.parse(store.activeNetwork);
        let active_account = JSON.parse(store.activeAccount);
        let provider = new ethers.providers.JsonRpcProvider(active_network.rpc);
        let wallet = new ethers.Wallet(active_account.privateKey);
        let sign = wallet.connect(provider);
        let TransferData = {
          ...params[0],
          nonce: result.nonce,
          gasLimit: result.gasLimit,
          gasPrice: toBigNumber(result.gasPrice, 9),
        };
        delete TransferData.gas;
        let tx = await sign.sendTransaction(TransferData);

        Toast.show('交易发送完成');

        let transactionLog = {
          contractAddress: params[0].to,
          isStatus: 0,
          hash: tx.hash,
          rpc: active_network.rpc,
          walletAddress: active_account.address,
          createTime: new Date().getTime(),
          decimals: result.decimals
        };

        $store.dispatch({
          type: transferLog.ADD,
          item: transactionLog
        });

        resolve(tx.hash);

        let tx1 = await tx.wait();

        if (tx1.status === 1) {
          $store.dispatch({
            type: transferLog.UPDATE,
            item: {
              hash: tx1.transactionHash,
              isStatus: 1
            }
          });
          Toast.show('交易完成');
        } else {
          $store.dispatch({
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
        Alert.alert(`${error}`);
      }
    })
  };

  // 获取交易参数
  private async getTransferParams(params: Array<any>) {
    try {
      let store = $store.getState();
      let active_network = JSON.parse(store.activeNetwork);
      let active_account = JSON.parse(store.activeAccount);
      let provider = new ethers.providers.JsonRpcProvider(active_network.rpc);
      let _contract = Token__factory.connect(params[0].to, provider);

      let gasLimitRequest = this.eth_call({ method: 'eth_estimateGas', params });
      let gasPriceRequest = provider.getGasPrice();
      let nonceRequest = provider.getTransactionCount(active_account.address);
      let contractSymbolRequest = _contract.symbol();
      let decimalsRequest = _contract.decimals();
      let [gasLimit, gasPrice, nonce, contractSymbol, decimals]: any = await Promise.allSettled([gasLimitRequest, gasPriceRequest, nonceRequest, contractSymbolRequest, decimalsRequest]);

      if (gasLimit.status === 'fulfilled' && gasLimit.value.error) return { error: gasLimit.value.error };

      return {
        gasPrice: (Number(toFixed2(fromBigNumber(gasPrice.value, 9), 2)) + 0.5).toString(),
        gasLimit: BigNumber.from(gasLimit.value),
        nonce: nonce.value,
        contractSymbol: contractSymbol.value,
        decimals: decimals.value
      };
    } catch (error) {
      Toast.show('参数获取失败');
    }
  }
};
