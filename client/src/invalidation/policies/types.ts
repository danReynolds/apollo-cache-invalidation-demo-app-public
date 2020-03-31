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

export interface PolicyActionCacheOperations {
  read: (typeName: string) => EntityDataResult[];
  evict: (typeName: string, fieldName?: string, meta?: object) => boolean;
  modify: (typeName: string, updatedData?: any) => void;
}

export interface PolicyActionBatchOperations {
  evict: (typeName: string, fieldName?: string, meta?: object) => void;
  modify: (typeName: string, updatedData?: any) => void;
}

export type PolicyActionOperations = PolicyActionCacheOperations | PolicyActionBatchOperations;

export interface InvalidationPolicyManagerConfig {
    policies: InvalidationPolicies;
    cacheOperations: PolicyActionCacheOperations
}

export interface PolicyActionMeta {
  id: string;
  parent: object;
}

export enum PolicyActionOperationType {
  Evict,
  Modify
}

export interface PolicyActionBatchEntry {
  dataId: string;
  fieldName?: string;
  operationType: PolicyActionOperationType;
  meta?: object;
}

export interface PolicyActionBatch {
  [index: string]: PolicyActionBatchEntry;
}