"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWalletEventMethodMatch = exports.deprecated = void 0;
function deprecated(type, message) {
    console.warn(`%cDEPRECATED ${type}: ${message}`, 'color: red');
}
exports.deprecated = deprecated;
function isWalletEventMethodMatch(method, name) {
    return method === `wallet_events_${name}`;
}
exports.isWalletEventMethodMatch = isWalletEventMethodMatch;
