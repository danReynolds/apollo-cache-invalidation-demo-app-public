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
    this.invalidationPolicyManager = new InvalidationPolicyManager({ policies: invalidationPolicies, entityStore: this.entityStoreProxy });
  }

  write(options: any) {
    const writeResults = Object.values(options.result).forEach((resultValue: any) => {
      const { __typename: resultValueType } = resultValue;
      if (resultValueType === "CreateEmployeeResponse") {
        debugger;
        const data = this.entityStoreProxy.readDataForType("Employee");
        debugger;
      }
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
