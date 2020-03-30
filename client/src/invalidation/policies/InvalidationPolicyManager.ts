import {
    InvalidationPolicies,
    InvalidationPolicy,
    InvalidationPolicyEvent,
    InvalidationPolicyManagerConfig,
} from './types';
import { getPolicyEventHandler } from './helpers';

export default class InvalidationPolicyManager {
    private config: InvalidationPolicyManagerConfig;

    constructor(config: InvalidationPolicyManagerConfig) {
       this.config = config;
    }

    getPolicy(typeName: string): InvalidationPolicy {
        return this.config.policies[typeName];
    }

    getPolicyForEvent(typeName: string, policyEvent: InvalidationPolicyEvent) {
        const policyForType = this.getPolicy(typeName);
        if (!policyForType) {
            return null;
        }
        return policyForType[getPolicyEventHandler(policyEvent)];
    }

    runPolicy(typeName: string, policyEvent: InvalidationPolicyEvent, policyMeta: object) {
        const eventPolicyForType = this.getPolicyForEvent(typeName, policyEvent);
        if (!eventPolicyForType) {
            return;
        }
        Object.keys(eventPolicyForType).forEach((typeName: string) => {
            const { cacheOperations } = this.config;
            const dataForType = cacheOperations.read(typeName);
            const policyAction = eventPolicyForType[typeName];

            dataForType.forEach((entryData => {
                const metaDataId = entryData.storeFieldName || entryData.dataId;
                debugger;
                policyAction(this.config.cacheOperations, entryData, {
                    ...policyMeta,
                    id: metaDataId,
                });
            }));
        })
    }

    runWritePolicy(typeName: string, meta: object) {
        return this.runPolicy(typeName, InvalidationPolicyEvent.Write, meta);
    }

    runEvictPolicy(typeName: string, meta: any) {
        return this.runPolicy(typeName, InvalidationPolicyEvent.Evict, meta);
    }
}