import {
  InvalidationPolicyCacheOperations,
  PolicyActionCacheOperations,
  PolicyActionBatch,
  PolicyActionCacheEntity,
  PolicyActionOperationType
} from "./types";
import { makeEntityId } from "../helpers";

interface PolicyActionBatcherConfig {
  cacheOperations: InvalidationPolicyCacheOperations;
}

export default class PolicyActionBatcher {
  private batch: PolicyActionBatch = {};

  private config: PolicyActionBatcherConfig;

  private batchCacheOperations: PolicyActionCacheOperations;

  private pendingBatchEntry?: {
    id: string;
    entity: PolicyActionCacheEntity;
  };

  constructor(config: PolicyActionBatcherConfig) {
    this.config = config;
    this.batchCacheOperations = {
      evict: this.createBatchCacheOperation(PolicyActionOperationType.Evict),
      modify: this.createBatchCacheOperation(PolicyActionOperationType.Modify)
    };
  }

  private createBatchCacheOperation(operationType: PolicyActionOperationType) {
    return (...args: any): boolean => {
      const { batch } = this;

      if (!this.pendingBatchEntry) {
        return true;
      }

      const {
        id: pendingBatchEntryId,
        entity: pendingBatchEntryEntity
      } = this.pendingBatchEntry;

      const existingBatchEntry = batch[pendingBatchEntryId];

      // If multiple operations come in for the same entityName such as multiple evictions of the same entity,
      // de-dupe them across the current invalidation level and prioritize them by ranked operation types
      if (
        !existingBatchEntry ||
        operationType < existingBatchEntry.operationType
      ) {
        batch[pendingBatchEntryId] = {
          entity: pendingBatchEntryEntity,
          operationType,
          args
        };
      }
      return true;
    };
  }

  addAction(
    policyAction: Function,
    policyActionCacheEntity: PolicyActionCacheEntity
  ) {
    const { dataId, fieldName } = policyActionCacheEntity;
    const batchEntityEntryId = makeEntityId(dataId, fieldName);

    this.pendingBatchEntry = {
      id: batchEntityEntryId,
      entity: policyActionCacheEntity
    };
    policyAction(this.batchCacheOperations, policyActionCacheEntity);
    this.pendingBatchEntry = undefined;
  }

  run() {
    const { cacheOperations } = this.config;
    Object.values(this.batch).forEach(({ operationType, args, entity }) => {
      switch (operationType) {
        case PolicyActionOperationType.Evict: {
          const [dataId, fieldName] = args;
          cacheOperations.evict(dataId, fieldName, entity.data);
          break;
        }
        case PolicyActionOperationType.Modify: {
          const [dataId, modifiers] = args;
          cacheOperations.modify(dataId, modifiers, false);
        }
        default:
          break;
      }
    });
    this.batch = {};
  }
}
