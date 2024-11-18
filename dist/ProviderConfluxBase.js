import { IInjectedProviderNames } from '@chargerwallet/cross-inpage-provider-types';
import { ProviderBase } from '@chargerwallet/cross-inpage-provider-core';
class ProviderConfluxBase extends ProviderBase {
    constructor(props) {
        super(props);
        this.providerName = IInjectedProviderNames.conflux;
    }
    request(data) {
        return this.bridgeRequest(data);
    }
}
export { ProviderConfluxBase };
