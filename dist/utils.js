export function deprecated(type, message) {
    console.warn(`%cDEPRECATED ${type}: ${message}`, 'color: red');
}
export function isWalletEventMethodMatch(method, name) {
    return method === `wallet_events_${name}`;
}
