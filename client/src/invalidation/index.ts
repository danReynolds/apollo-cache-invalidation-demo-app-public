import _ from "lodash";
import { InMemoryCache, InMemoryCacheConfig, StoreObject } from "@apollo/client";
import EntityStoreEventManager from "./EntityStoreEventManager";
import InvalidationPolicyManager from './policies/InvalidationPolicyManager'
import { InvalidationPolicies } from './policies/types';

interface InvalidationInMemoryCacheConfig extends InMemoryCacheConfig {
  invalidationPolicies: InvalidationPolicies;
}

export default class InvalidationInMemoryCache extends InMemoryCache {
  private entityStoreEventManager: EntityStoreEventManager;
  private invalidationPolicyManager: InvalidationPolicyManager;
  
  constructor(config: InvalidationInMemoryCacheConfig) {
    const { invalidationPolicies, ...inMemoryCacheConfig } = config;
    super(inMemoryCacheConfig);

    this.entityStoreEventManager = new EntityStoreEventManager();
    this.invalidationPolicyManager = new InvalidationPolicyManager(invalidationPolicies);
    this.proxyEntityStoreMerge();
  }

  write(options: any) {
    const writeResults = Object.values(options.result).forEach((resultValue: any) => {
      const { __typename: resultValueType } = resultValue;
      if (resultValueType === "CreateEmployeeResponse") {
        debugger;
        this.evict("Employee:1");
      }
    });
    return super.write(options);
  }

  evict(dataId: string, fieldName?: string) {
    const evicted = super.evict(dataId, fieldName);

    if (evicted) {
      this.entityStoreEventManager.onEvict(dataId, fieldName);
    }

    return evicted;
  }

  proxyEntityStoreMerge() {
    // @ts-ignore
    const { data: entityStore, entityStoreEventManager } = this;
    const { merge } = entityStore;
    // @ts-ignore
    this.data.merge = function proxyMerge(dataId: string, incomingStoreEntities: StoreObject) {
      entityStoreEventManager.onMerge(dataId, incomingStoreEntities);
      console.log(entityStore.get(dataId, 'employees'))
      debugger;
      return merge.call(entityStore, dataId, incomingStoreEntities);
    };
  }
}

/*
Example Config:

const cache = new InvalidationInMemoryCache({
    typePolicies: {...},
    fieldPolicies: {...},
    invalidationPolicies: {
        CreateFinancialPortalResponse: {
          onStore: {
            FinancialPortalsResponse: push(),
          },
        },
        DeleteFinancialPortalResponse: {
          onStore: {
            FinancialPortalsResponse: invalidate(),
          },
        }
    }
})
*/
