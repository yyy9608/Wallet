import { BigNumber } from "ethers";

type AccountType = {
  address: string,
  accountName: string,
  privateKey: string,
  publicKey: string,
  words: string,
  pwd: string,
  backup?: Boolean
}

type NetworkType = {
  rpc: string,
  image?: string,
  name: string,
  chainID: string,
  symbol: string,
  browser: string,
  decimals: number,
  remove: Boolean
}

type TransactionType = {
  account: string,
  rpc: string,
  data: any,
  func: string,
  decimals: number,
  contract: string,
  tx: any,
  symbol: string
};

type TransferLogType = {
  contractAddress: string,
  isStatus: number,
  hash: string,
  rpc: string,
  walletAddress: string,
  createTime?: number,
  decimals?: number
};

type TokenType = {
  contractAddress: string,
  contractName: string,
  decimals: number,
  symbol: string,
  rpc: string,
  walletAddress: string,
  images?: string | any
};

type SwapTransactionLogType = {
  hash: string,
  wallet_address: string,
  chainId: string,
  createTime?: number
}

type BigNumberish = BigNumber | string | number

// 链上交易数据类型
type TransactionRequest = {
  to: string,
  from?: string,
  nonce?: BigNumberish,
  gasLimit?: BigNumberish,
  gasPrice?: BigNumberish,
  data?: string,
  value: BigNumberish,
  chainId?: number
  type?: number;
  accessList?: any;
  maxPriorityFeePerGas?: BigNumberish;
  maxFeePerGas?: BigNumberish;
  customData?: Record<string, any>;
  ccipReadEnabled?: boolean;
}

// 交易数据类型
type LsyWalletTransferRequest = {
  from: string,
  to: string,
  data: TransactionRequest | any,
  method: string,
  contractAddress: string,
  decimals?: number
}

// NFT LIST
type NFTListType = {
  balance: number
  name: string,
  image?: string,
  contract: string,
  account: string,
  chainId: string
}

// RPC 数据类型
interface JsonRpcRequest {
  id?: number | string;
  jsonrpc: '2.0';
  method: string;
  params?: Array<any> | any;
}

// 添加代币
type WatchAssetParams = {
  type: 'ERC20'; // In the future, other standards will be supported
  options: {
    address: string; // The address of the token contract
    symbol: string; // A ticker symbol or shorthand, up to 5 characters
    decimals: number; // The number of token decimals
    image: string | string[]; // A string url of the token logo
  };
}

// 添加网络
type AddEthereumChainParameter = {
  chainId: string; // A 0x-prefixed hexadecimal string
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: 18;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[]; // Currently ignored.
}

// 浏览器openMessage消息类型
interface Payload extends JsonRpcRequest {
  pageMetadata?: { icon: string; title: string; desc?: string; origin: string };
}

interface ApproveType extends JsonRpcRequest {
  approve: () => void,
  reject: () => void,
  origin: string,
}

// 页面数据
interface PageMetadata {
  icon: string;
  title: string;
  origin: string;
  hostname: string;
  desc?: string;
  themeColor: string | null;
}

interface AddTokenModalType extends WatchAssetParams {
  approve: () => void,
  reject: () => void,
  balance: BigNumber,
  name: string
}

interface AddNetworkType extends AddEthereumChainParameter {
  approve: () => void,
  reject: () => void,
  balance: BigNumber,
  name: string,
  pageMetadata?: PageMetadata
}

interface SwitchNetworkType extends JsonRpcRequest {
  approve: () => void,
  reject: () => void,
  pageMetadata?: PageMetadata
}

interface ApproveTransferModalType extends JsonRpcRequest {
  approve: () => void,
  reject: () => void,
  pageMetadata?: PageMetadata,
  inputData: InputDataType,
  result: TransferRequestParamsType,
}

interface InputDataType {
  inputs: Array<string | any>,
  method: string | any,
  names: Array<string | any>,
  types: Array<string | any>,
}

interface TransferRequestParamsType {
  gasLimit: BigNumber,
  gasPrice: string,
  nonce: number,
  decimals: number,
  contractSymbol: string
}

interface SignerDataType {
  walletAddress: string,
  decimals: string | number,
  signData: string,
  contractAddress: string
}

export type {
  AccountType,
  NetworkType,
  TransactionType,
  TokenType,
  TransactionRequest,
  LsyWalletTransferRequest,
  TransferLogType,
  JsonRpcRequest,
  Payload,
  WatchAssetParams,
  AddEthereumChainParameter,
  ApproveType,
  PageMetadata,
  AddTokenModalType,
  AddNetworkType,
  SwitchNetworkType,
  TransferRequestParamsType,
  InputDataType,
  ApproveTransferModalType,
  SignerDataType,
  NFTListType,
  SwapTransactionLogType
};