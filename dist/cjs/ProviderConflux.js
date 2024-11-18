"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderEvents = exports.DeprecatedType = exports.ProviderConflux = void 0;
const fast_deep_equal_1 = __importDefault(require("fast-deep-equal"));
const extension_bridge_injected_1 = require("@chargerwallet/extension-bridge-injected");
const cross_inpage_provider_errors_1 = require("@chargerwallet/cross-inpage-provider-errors");
const ProviderConfluxBase_1 = require("./ProviderConfluxBase");
const types_1 = require("./types");
Object.defineProperty(exports, "DeprecatedType", { enumerable: true, get: function () { return types_1.DeprecatedType; } });
Object.defineProperty(exports, "ProviderEvents", { enumerable: true, get: function () { return types_1.ProviderEvents; } });
const utils_1 = require("./utils");
class ProviderConflux extends ProviderConfluxBase_1.ProviderConfluxBase {
    constructor(props) {
        var _a;
        super(Object.assign(Object.assign({}, props), { bridge: props.bridge || (0, extension_bridge_injected_1.getOrCreateExtInjectedJsBridge)({ timeout: props.timeout }) }));
        this.isConfluxPortal = true;
        this.isFluent = true;
        this.isChargerWallet = true;
        this._isConnected = false;
        this._initialized = false;
        this._chainId = '';
        this._networkVersion = '';
        this._selectedAddress = '';
        this._accounts = [];
        this._log = (_a = props.logger) !== null && _a !== void 0 ? _a : window.console;
        this._registerEvents();
        void this._initializeState();
    }
    _initializeState() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.request({
                    method: 'cfx_getProviderState',
                });
                const { chainId, networkId } = res;
                this.emit(types_1.ProviderEvents.CONNECT, { chainId, networkId });
            }
            catch (error) {
                this._log.error('ChargerWallet: Failed to get initial state. Please report this bug.', error);
            }
            finally {
                this._initialized = true;
            }
        });
    }
    _registerEvents() {
        window.addEventListener('chargerwallet_bridge_disconnect', () => {
            this._handleDisconnected();
        });
        this.on(types_1.ProviderEvents.MESSAGE_LOW_LEVEL, (payload) => {
            const { method, params } = payload;
            if ((0, utils_1.isWalletEventMethodMatch)(method, types_1.ProviderEvents.ACCOUNTS_CHANGED)) {
                this._handleAccountsChanged(params);
            }
            if ((0, utils_1.isWalletEventMethodMatch)(method, types_1.ProviderEvents.CHAIN_CHANGED)) {
                this._handleChainChanged(params);
            }
        });
        this.on(types_1.ProviderEvents.CONNECT, () => {
            this._isConnected = true;
            // DEPRECATED
            {
                this.request({ method: 'cfx_chainId' })
                    .then((result) => {
                    this._chainId = result;
                    const networkId = parseInt(result, 16);
                    this._networkVersion = networkId.toString(10);
                })
                    .catch(() => {
                    this._chainId = '';
                    this._networkVersion = '';
                });
                this.request({ method: 'cfx_accounts' })
                    .then((result) => {
                    if (!result)
                        this._selectedAddress = '';
                    else
                        this._selectedAddress = result[0];
                })
                    .catch(() => (this._selectedAddress = ''));
                this.on(types_1.ProviderEvents.CHAIN_CHANGED, (chainId) => {
                    this._chainId = chainId;
                    const networkId = parseInt(chainId, 16);
                    this._networkVersion = networkId.toString(10);
                });
                this.on(types_1.ProviderEvents.ACCOUNTS_CHANGED, (accounts) => {
                    this._selectedAddress = accounts[0];
                });
            }
        });
    }
    isAccountsChanged(accounts) {
        return !(0, fast_deep_equal_1.default)(this._accounts, accounts);
    }
    _handleAccountsChanged(accounts) {
        let _accounts = accounts;
        if (!Array.isArray(accounts)) {
            this._log.error('Chargerwallet: Received invalid accounts parameter. Please report this bug.', accounts);
            _accounts = [];
        }
        for (const account of _accounts) {
            if (typeof account !== 'string') {
                this._log.error('Chargerwallet: Received non-string account. Please report this bug.', accounts);
                _accounts = [];
                break;
            }
        }
        if (this.isAccountsChanged(_accounts)) {
            this._accounts = _accounts;
            if (this._selectedAddress !== _accounts[0]) {
                this._selectedAddress = _accounts[0];
            }
            if (this._initialized) {
                this.emit(types_1.ProviderEvents.ACCOUNTS_CHANGED, _accounts);
            }
        }
    }
    isNetworkChanged(chainId) {
        return chainId !== this._chainId;
    }
    _handleChainChanged({ chainId, networkId } = {}) {
        if (!chainId ||
            typeof chainId !== 'string' ||
            !chainId.startsWith('0x') ||
            !networkId ||
            typeof networkId !== 'string') {
            this._log.error('Chargerwallet: Received invalid network parameters. Please report this bug.', {
                chainId,
                networkId,
            });
            return;
        }
        if (networkId === 'loading') {
            this._handleDisconnected();
        }
        else {
            this._handleConnected({ chainId, networkId });
            if (this.isNetworkChanged(chainId)) {
                this._chainId = chainId;
                if (this._initialized) {
                    this.emit(types_1.ProviderEvents.CHAIN_CHANGED, chainId);
                    // DEPRECATED
                    {
                        this.emit(types_1.ProviderEvents.NETWORK_CHANGED, networkId);
                        this.emit(types_1.ProviderEvents.CHAIN_ID_CHANGE, chainId);
                    }
                }
            }
        }
    }
    _handleConnected(network) {
        if (!this._isConnected) {
            this._isConnected = true;
            this.emit(types_1.ProviderEvents.CONNECT, network);
        }
    }
    _handleDisconnected() {
        if (this._isConnected) {
            this._isConnected = false;
            this.emit(types_1.ProviderEvents.DISCONNECT);
        }
    }
    isConnected() {
        return this._isConnected;
    }
    request(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { method, params } = args;
            if (!method || typeof method !== 'string' || method.length === 0) {
                throw cross_inpage_provider_errors_1.web3Errors.rpc.methodNotFound();
            }
            if (params !== undefined &&
                !Array.isArray(params) &&
                (typeof params !== 'object' || params === null)) {
                throw cross_inpage_provider_errors_1.web3Errors.rpc.invalidParams();
            }
            if (args.method.startsWith('eth_')) {
                args.method = args.method.replace('eth_', 'cfx_');
            }
            const resp = yield this.bridgeRequest(args);
            return resp;
        });
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    off(event, listener) {
        return super.off(event, listener);
    }
    emit(event, ...args) {
        return super.emit(event, ...args);
    }
    // DEPRECATED -----------------------
    get chainId() {
        (0, utils_1.deprecated)(types_1.DeprecatedType.PROPERTY, '"provider.chainId" is deprecated, please use "provider.request({method: "cfx_chainId"})" instead');
        return this._chainId;
    }
    get networkVersion() {
        (0, utils_1.deprecated)(types_1.DeprecatedType.PROPERTY, '"provider.networkVersion" is deprecated, please use "provider.request({method: "net_version"})" instead');
        return this._networkVersion;
    }
    get selectedAddress() {
        (0, utils_1.deprecated)(types_1.DeprecatedType.PROPERTY, '"provider.selectedAddress" is deprecated, please use "provider.request({method: "cfx_accounts"})" instead');
        return this._selectedAddress || null;
    }
    enable() {
        return __awaiter(this, void 0, void 0, function* () {
            (0, utils_1.deprecated)(types_1.DeprecatedType.METHOD, '"provider.enable" is deprecated, please use "provider.request({method: "cfx_requestAccounts"})" instead');
            return this.request({ method: 'cfx_requestAccounts' });
        });
    }
    sendAsync(request, callback) {
        (0, utils_1.deprecated)(types_1.DeprecatedType.METHOD, '"provider.sendAsync" is deprecated, please use "provider.request" instead');
        if (typeof callback !== 'function')
            throw new Error('Invalid callback, not a function');
        this.request(request)
            .then((resp) => callback(null, resp))
            .catch(callback);
    }
    send(args) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, utils_1.deprecated)(types_1.DeprecatedType.METHOD, '"provider.send" is deprecated, please use "provider.request" instead');
            const resp = yield this.request(args);
            return resp;
        });
    }
}
exports.ProviderConflux = ProviderConflux;
