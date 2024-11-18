"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderEvents = exports.DeprecatedType = void 0;
var DeprecatedType;
(function (DeprecatedType) {
    DeprecatedType["EVENT"] = "EVENT";
    DeprecatedType["METHOD"] = "METHOD";
    DeprecatedType["PROPERTY"] = "PROPERTY";
})(DeprecatedType = exports.DeprecatedType || (exports.DeprecatedType = {}));
var ProviderEvents;
(function (ProviderEvents) {
    ProviderEvents["CONNECT"] = "connect";
    ProviderEvents["DISCONNECT"] = "disconnect";
    ProviderEvents["ACCOUNTS_CHANGED"] = "accountsChanged";
    ProviderEvents["CHAIN_CHANGED"] = "chainChanged";
    ProviderEvents["MESSAGE"] = "message";
    ProviderEvents["MESSAGE_LOW_LEVEL"] = "message_low_level";
    // DEPRECATED
    ProviderEvents["NETWORK_CHANGED"] = "networkChanged";
    ProviderEvents["CHAIN_ID_CHANGE"] = "chainIdChanged";
})(ProviderEvents = exports.ProviderEvents || (exports.ProviderEvents = {}));
