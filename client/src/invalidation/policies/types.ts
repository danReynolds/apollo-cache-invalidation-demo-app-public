import { EntityDataResult } from '../entity-store/types';
export enum InvalidationPolicyEvent {
    Write = "Write",
    Evict = "Evict"
}

export enum InvalidationPolicyLifecycleEvent {
    onEvict = "onEvict",
    onWrite = "onWrite",
}

export interface InvalidationPolicies {
    [typeName: string]: InvalidationPolicy;
}

export enum PolicyActionOperationType {
  Evict,
  Modify
}

export interface PolicyActionMeta {
  parent: {
    data?: object;
    variables?: object;
  } 
}

export type PolicyActionCacheEntity = EntityDataResult & PolicyActionMeta;

export interface InvalidationPolicyCacheOperations {
  read: (typeName: string) => EntityDataResult[];
  evict: (dataId: string, fieldName?: string, meta?: object) => boolean;
  modify: (dataId: string, modifiers: any, optimistic?: boolean) => boolean;
}

export type PolicyActionCacheOperations = {
  evict: (dataId: string, fieldName?: string) => boolean;
  modify: (dataId: string, modifiers: any) => boolean;
}

export type InvalidationPolicy = {
  [lifecycleEvent in InvalidationPolicyLifecycleEvent]?: {
    [typeName: string]: (cacheOperations: PolicyActionCacheOperations, cacheEntity: PolicyActionCacheEntity) => void;
  }
}

export interface InvalidationPolicyManagerConfig {
    policies: InvalidationPolicies;
    cacheOperations: InvalidationPolicyCacheOperations;
}

export interface PolicyActionBatchEntry {
  operationType: PolicyActionOperationType;
  args: any[],
  entity: PolicyActionCacheEntity;
}

export type PolicyAction = (cacheOperations: InvalidationPolicyCacheOperations, entityData: EntityDataResult, actionMeta: PolicyActionMeta) => void;

export interface PolicyActionBatch {
  [index: string]: PolicyActionBatchEntry;
}