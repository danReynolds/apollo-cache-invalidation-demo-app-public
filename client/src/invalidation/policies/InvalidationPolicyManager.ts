import {
    InvalidationPolicies,
    InvalidationPolicy,
    InvalidationPolicyEvent,
} from './types';
import { getPolicyEventHandler } from './helpers';

export default class InvalidationPolicyManager {
    private policies: InvalidationPolicies;

    constructor(policies: InvalidationPolicies) {
        this.policies = policies;
    }

    getPolicy(typeName: string): InvalidationPolicy {
        return this.policies[typeName];
    }

    getPolicyForEvent(typeName: string, policyEvent: InvalidationPolicyEvent) {
        return this.getPolicy(typeName)[getPolicyEventHandler(policyEvent)];
    }

    runPolicy(typeName: string, policyEvent: InvalidationPolicyEvent) {
        const eventPolicyForType = this.getPolicyForEvent(typeName, policyEvent);
        if (!eventPolicyForType) {
            return;
        }
        Object.keys(eventPolicyForType).forEach((typeName: string) => {
            const policyAction = eventPolicyForType[typeName];
            
        })
    }

    runWritePolicy(typeName: string) {
        return this.runPolicy(typeName, InvalidationPolicyEvent.Write);
    }

    runEvictPolicy(typeName: string) {
        return this.runPolicy(typeName, InvalidationPolicyEvent.Evict);
    }
}