// import EventEmitter from "events";

// export class MetaMaskProvider {
//   constructor() {
//     this.isMetaMask = true;
//     this.firstWallet = true;
//     this.event = new EventEmitter();
//     this._handleRequestEvent = {};
//     this.selectedAddress = null;
//     this.chainId = null;
//     this._state = {
//       rpcId: 0
//     };
//     this._handleEvent = {};
//     this.request = this.request.bind(this);
//     this._handleRemoveListener = this._handleRemoveListener.bind(this);
//     this.on = this.on.bind(this);
//     this._dispatchEvent = this._dispatchEvent.bind(this);
//     this._addListener = this._addListener.bind(this);
//     this._handleChainChanged = this._handleChainChanged.bind(this);
//     this._handleAccountsChanged = this._handleAccountsChanged.bind(this);

//     window.addEventListener('message', (e) => {
//       let data = typeof e.data === 'string' ? JSON.parse(e.data) : {};
//       if (data && data.from === 'content-script' && data.to === 'inpage') {
//         if (data.method === 'eth_accounts') {
//           this._dispatchEvent(data.method, data.params.address);
//         };
//         if (data.method === 'eth_chainId') {
//           this._dispatchEvent(data.method, data.params.chainId);
//         };
//         if (data.method === 'eth_blockNumber') {
//           this._dispatchEvent(data.method, data.params.blockNumber);
//         };
//         if (data.method === 'eth_estimateGas') {
//           this._dispatchEvent(data.method, data.params.estimateGas);
//         }
//       }
//     })
//   };
//   _handleAccountsChanged() { };
//   _handleChainChanged() { };

//   request({ method, params }) {
//     this._state.rpcId++;
//     window.postMessage(JSON.stringify({
//       jsonrpc: '2.0',
//       id: this._state.rpcId,
//       method,
//       params,
//       from: 'inpage',
//       to: 'content-script'
//     }));
//     return new Promise((resolve) => {
//       this._addListener(method, resolve);
//     });
//   };
//   on(type, fn) {
//     const support = [
//       'accountsChanged',
//       'chainChanged'
//     ];
//     if (support.includes(type)) {
//       this._addListener(type, fn);
//     };
//     window.addEventListener("message", (event) => {
//       let data = typeof event.data === 'string' ? JSON.parse(event.data) : {};
//       // 切换账号
//       if (data && data.method === 'accountsChanged' && data.params.address) {
//         this._dispatchEvent('accountsChanged', data.params.address);
//       };
//       // 切换网络
//       if (data && data.method === 'chainChanged' && data.params.chainId) {
//         this._dispatchEvent('chainChanged', data.params.chainId);
//       };
//     });
//   };
//   _handleRemoveListener(type) {
//     if (!(type in this._handleEvent)) {
//       return new Error("Invalid event");
//     } else {
//       delete this._handleEvent[type];
//     }
//   };
//   _dispatchEvent(type, params) {
//     const support = [
//       'accountsChanged',
//       'chainChanged'
//     ];
//     if (!(type in this._handleEvent)) {
//       return new Error("Not Registered")
//     };
//     this._handleEvent[type].forEach(handler => {
//       handler(params)
//     });
//     if (support.includes(type)) return;
//     delete this._handleEvent[type];
//   };
//   _addListener(type, fn) {
//     if (!(this._handleEvent[type])) {
//       this._handleEvent[type] = []
//     }
//     this._handleEvent[type].push(fn);
//   };
// };

// window.ethereum = new MetaMaskProvider();