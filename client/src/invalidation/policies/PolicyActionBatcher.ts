import { PolicyActionBatch, PolicyActionMeta, PolicyActionOperationType, PolicyActionBatchOperations } from './types';
import { makeEntityId } from '../helpers';

interface PolicyActionBatcherConfig {
    cacheOperations: PolicyActionBatchOperations;
}
export default class PolicyActionBatcher {
    private batch: PolicyActionBatch = {};

    private config: PolicyActionBatcherConfig;
    
    private batchOperation = (operationType: PolicyActionOperationType) =>
        (dataId: string, fieldName?: string, meta?: object) => this.addAction(operationType, dataId, fieldName, meta);

    batchCacheOperations: PolicyActionBatchOperations = {
        evict: this.batchOperation(PolicyActionOperationType.Evict),
        modify: this.batchOperation(PolicyActionOperationType.Modify),
    }

    constructor(config: PolicyActionBatcherConfig) {
        this.config = config;
    }

    addAction(operationType: PolicyActionOperationType, dataId: string, fieldName?: string, meta?: object) {
        const { batch } = this;
        const entityName = makeEntityId(dataId, fieldName);
        const batchEntryForEntity = batch[entityName];

        // If multiple operations come in for the same entityName such as multiple evictions of the same entity,
        // de-dupe them and prioritize them by ranked operation types
        if (!batchEntryForEntity || batchEntryForEntity.operationType > operationType) {
            batch[entityName] = {
                operationType,
                dataId,
                fieldName,
                meta,
            }
        }
    }

    run() {
        const { cacheOperations: { evict } } = this.config;
        Object.values(this.batch).forEach(batchEntity => {
            const { dataId, fieldName, meta } = batchEntity;
            if (batchEntity.operationType === PolicyActionOperationType.Evict) {
                // Eviction does not support evicting by storeFieldNames currently:
                // https://github.com/apollographql/apollo-client/issues/6098
                // so instead we just evict by field name, which is one of the reasons that we want to batch
                // across many store field names that resolve to the same field name
                evict(dataId, fieldName, meta);
            }
        })
        this.batch = {};
    }
}