import _ from "lodash";
import { InMemoryCache, InMemoryCacheConfig, StoreObject } from "@apollo/client";
import EntityStoreProxy from "./EntityStoreProxy";
import InvalidationPolicyManager from './policies/InvalidationPolicyManager'
import { InvalidationPolicies } from './policies/types';

interface InvalidationInMemoryCacheConfig extends InMemoryCacheConfig {
  invalidationPolicies: InvalidationPolicies;
}

export default class InvalidationInMemoryCache extends InMemoryCache {
  private entityStoreProxy: EntityStoreProxy;
  private invalidationPolicyManager: InvalidationPolicyManager;
  
  constructor(config: InvalidationInMemoryCacheConfig) {
    const { invalidationPolicies, ...inMemoryCacheConfig } = config;
    super(inMemoryCacheConfig);

    // @ts-ignore
    this.entityStoreProxy = new EntityStoreProxy({ entityStore: this.data });
    this.invalidationPolicyManager = new InvalidationPolicyManager({
      policies: invalidationPolicies,
      cacheOperations: {
        evict: this.evict.bind(this),
        read: this.entityStoreProxy.readDataForType.bind(this.entityStoreProxy)
      }
    });
  }

  write(options: any) {
    const { variables, result } = options;
    const writeResults = Object.values(result).filter((operationResult: any) => !!operationResult.__typename).forEach((operationResult: any) => {
      this.invalidationPolicyManager.runWritePolicy(operationResult.__typename, { invalidator: { data: operationResult, variables } });
    });
    return super.write(options);
  }

  evict(dataId: string, fieldName?: string) {
    const evicted = super.evict(dataId, fieldName);

    if (evicted) {
      this.entityStoreProxy.evict(dataId, fieldName);
    }

    return evicted;
  }
}
