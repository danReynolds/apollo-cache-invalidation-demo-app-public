import _ from 'lodash';
import {
    InvalidationPolicy,
    InvalidationPolicyEvent,
    InvalidationPolicyManagerConfig,
    PolicyActionMeta,
    PolicyActionCacheOperations,
} from './types';
import PolicyActionBatcher from './PolicyActionBatcher';
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

    runPolicy(typeName: string, policyEvent: InvalidationPolicyEvent, policyMeta: PolicyActionMeta) {
        const eventPolicyForType = this.getPolicyForEvent(typeName, policyEvent);
        if (!eventPolicyForType) {
            return;
        }

        const policyActionBatch = new PolicyActionBatcher({ cacheOperations: this.config.cacheOperations });

        Object.keys(eventPolicyForType).forEach((typeName: string) => {
            const { cacheOperations } = this.config;
            const entityDataResultsForType = cacheOperations.read(typeName) ?? [];
            const policyAction = eventPolicyForType[typeName];
            entityDataResultsForType.forEach((entityDataResult => {
                policyActionBatch.addAction(policyAction, {
                    ...entityDataResult,
                    ...policyMeta,
                })
            }));
        });
        policyActionBatch.run();
    }

    runWritePolicy(typeName: string, policyMeta: PolicyActionMeta) {
        return this.runPolicy(typeName, InvalidationPolicyEvent.Write, policyMeta);
    }

    runEvictPolicy(typeName: string, policyMeta: PolicyActionMeta) {
        return this.runPolicy(typeName, InvalidationPolicyEvent.Evict, policyMeta);
    }
}