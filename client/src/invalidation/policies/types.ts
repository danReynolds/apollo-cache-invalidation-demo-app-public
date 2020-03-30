export enum InvalidationPolicyEvent {
    Write = "Write",
    Evict = "Evict"
}

export enum InvalidationPolicyLifecycleEvent {
    onEvict = "onEvict",
    onWrite = "onWrite",
}

export type InvalidationPolicy = {
  [lifecycleEvent in InvalidationPolicyLifecycleEvent]?: {
    [typeName: string]: Function;
  }
}

export interface InvalidationPolicies {
    [typeName: string]: InvalidationPolicy;
}

export interface InvalidationPolicyManagerConfig {
    policies: InvalidationPolicies;
    entityStore: any;
}