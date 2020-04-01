import {
  PolicyActionBatchEntry,
  PolicyCacheOperationKey,
  InvalidationPolicyCacheOperations,
  PolicyActionBatch,
} from "./types";
import { EntityDataResult } from "../entity-store/types";
import { makeEntityId } from "../helpers";

interface PolicyActionBatcherConfig {
  cacheOperations: InvalidationPolicyCacheOperations;
}

enum CacheOperationPriority {
  evict,
  modify,
  read
}

const cacheOperationKeyPriorityMap = {
  [PolicyCacheOperationKey.evict]: CacheOperationPriority.evict,
  [PolicyCacheOperationKey.modify]: CacheOperationPriority.modify,
  [PolicyCacheOperationKey.read]: CacheOperationPriority.read
};

export default class PolicyActionBatcher {
  private batch: PolicyActionBatch = {};

  private config: PolicyActionBatcherConfig;

  private batchCacheOperations: InvalidationPolicyCacheOperations;

  private pendingBatchEntityId: string | null = null;

  constructor(config: PolicyActionBatcherConfig) {
    this.config = config;
    this.batchCacheOperations = this.getBatchCacheOperations(this.config.cacheOperations);
  }

  getBatchCacheOperations(cacheOperations: InvalidationPolicyCacheOperations) {
    const { batch } = this;
    return Object.keys(cacheOperations).reduce(
      (acc, operationKey) => ({
        ...acc,
        [operationKey]: (...args: any) => {
          const batchEntityId = this.pendingBatchEntityId;
          if (!batchEntityId) {
            return;
          }
          const cacheOperationKey = operationKey as PolicyCacheOperationKey;
          const batchEntityEntry = batch[batchEntityId];

          // If multiple operations come in for the same entityName such as multiple evictions of the same entity,
          // de-dupe them and prioritize them by ranked operation types
          if (
            !batchEntityEntry ||
            cacheOperationKeyPriorityMap[batchEntityEntry.operationKey] >
              cacheOperationKeyPriorityMap[cacheOperationKey]
          ) {
            batch[batchEntityId] = {
              operationKey: cacheOperationKey,
              args
            };
          }
        }
      }),
      {} as InvalidationPolicyCacheOperations
    );
  }

  addAction(
    policyAction: Function,
    entityData: EntityDataResult,
    entityMeta: object
  ) {
    const { batch } = this;
    const { dataId, fieldName } = entityData;
    const metaDataId = entityData.storeFieldName || entityData.dataId;
    const entityId = makeEntityId(dataId, fieldName);

    this.pendingBatchEntityId = entityId;
    policyAction(this.batchCacheOperations, entityData, {
      ...entityMeta,
      id: metaDataId
    });
    this.pendingBatchEntityId = null;
  }

  run() {
    const { cacheOperations } = this.config;
    Object.values(this.batch).forEach(({ operationKey, args }) => {
      //@ts-ignore We do not know which operation is being executed so the typings are dynamic
      cacheOperations[operationKey](...args);
    });
    this.batch = {};
  }
}
