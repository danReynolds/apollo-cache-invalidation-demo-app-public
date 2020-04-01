import _ from "lodash";
import { InMemoryCache, InMemoryCacheConfig, StoreObject } from "@apollo/client";
import InvalidationPolicyManager from './policies/InvalidationPolicyManager'
import { InvalidationPolicies } from './policies/types';
import { EntityTypeMap, EntityStoreDataReader, EntityStoreWatcher } from './entity-store';
import { makeEntityId } from './helpers';

interface InvalidationInMemoryCacheConfig extends InMemoryCacheConfig {
  invalidationPolicies: InvalidationPolicies;
}

export default class InvalidationInMemoryCache extends InMemoryCache {
  private entityTypeMap: EntityTypeMap;
  private entityStoreDataReader: EntityStoreDataReader;
  private entityStoreWatcher: EntityStoreWatcher;
  private invalidationPolicyManager: InvalidationPolicyManager;
  private entityStore: any;
  
  constructor(config: InvalidationInMemoryCacheConfig) {
    const { invalidationPolicies, ...inMemoryCacheConfig } = config;
    super(inMemoryCacheConfig);

    // @ts-ignore
    this.entityStore = this.data;
    this.entityTypeMap = new EntityTypeMap();
    this.entityStoreDataReader = new EntityStoreDataReader({ entityStore: this.entityStore, entityTypeMap: this.entityTypeMap });
    this.entityStoreWatcher = new EntityStoreWatcher({ entityStore: this.entityStore, entityTypeMap: this.entityTypeMap });

    this.invalidationPolicyManager = new InvalidationPolicyManager({
      policies: invalidationPolicies,
      cacheOperations: {
        evict: this.evict.bind(this),
        read: this.entityStoreDataReader.readStoreByType.bind(this.entityStoreDataReader),
        modify: this.merge.bind(this),
      }
    });
  }

  write(options: any) {
    const { variables, result } = options;
    const writeResults = Object.values(result).filter((operationResult: any) => !!operationResult.__typename).forEach((operationResult: any) => {
      this.invalidationPolicyManager.runWritePolicy(operationResult.__typename, { parent: { data: operationResult, variables } });
    });
    return super.write(options);
  }

  evict(dataId: string, fieldName?: string, parent?: object) {
    const typename = this.entityTypeMap.readTypeByEntityId(makeEntityId(dataId, fieldName));
    const evicted = super.evict(dataId, fieldName);
    console.log(`Evicting ${dataId}:${fieldName} from cache`);
    
    if (evicted) {
      debugger;
      this.invalidationPolicyManager.runEvictPolicy(typename, { parent });
    }

    return evicted;
  }


  /**
   * Ideally we would use the InMemoryCache#modify here but it doesn't support modifying fields of a nested dataId
   * like ROOT_QUERY.queryName
   */
  merge(dataId: string, updatedData: object) {
    debugger;
    this.entityStore.merge(dataId, updatedData);
    this.broadcastWatches();
  }
}
