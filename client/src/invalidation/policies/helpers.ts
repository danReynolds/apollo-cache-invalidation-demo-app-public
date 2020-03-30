import { InvalidationPolicyEvent, InvalidationPolicyLifecycleEvent } from './types';

export const getPolicyEventHandler = (policyEvent: InvalidationPolicyEvent): InvalidationPolicyLifecycleEvent => `on${policyEvent}` as InvalidationPolicyLifecycleEvent;