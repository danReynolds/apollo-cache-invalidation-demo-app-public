import { EntityDataResult } from '../entity-store/types';

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

export enum PolicyCacheOperationKey {
  read = 'read',
  evict = 'evict',
  modify = 'modify'
}

export interface InvalidationPolicyCacheOperations {
  read: (typeName: string) => EntityDataResult[];
  evict: (typeName: string, fieldName?: string, meta?: object) => boolean;
  modify: (typeName: string, updatedData?: any) => void;
}

export interface InvalidationPolicyManagerConfig {
    policies: InvalidationPolicies;
    cacheOperations: InvalidationPolicyCacheOperations
}

export interface PolicyActionMeta {
  id: string;
  parent: object;
}

export interface PolicyActionBatchEntry {
  operationKey: PolicyCacheOperationKey;
  args: any[],
}

export type PolicyAction = (cacheOperations: InvalidationPolicyCacheOperations, entityData: EntityDataResult, actionMeta: PolicyActionMeta) => void;

export interface PolicyActionBatch {
  [index: string]: PolicyActionBatchEntry;
}