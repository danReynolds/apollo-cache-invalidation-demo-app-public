import { PolicyActionBatch, PolicyActionOperationType, PolicyActionBatchOperations } from './types';
import { createEntityName } from '../helpers';

interface PolicyActionBatcherConfig {
    cacheOperations: PolicyActionBatchOperations;
}


export default class PolicyActionBatcher {
    private batch: PolicyActionBatch = {};

    private config: PolicyActionBatcherConfig;
    
    private batchOperation = (operationType: PolicyActionOperationType) =>
        (dataId: string, fieldName?: string) => this.addAction(operationType, dataId, fieldName);

    batchCacheOperations: PolicyActionBatchOperations = {
        evict: this.batchOperation(PolicyActionOperationType.Evict),
    }

    constructor(config: PolicyActionBatcherConfig) {
        this.config = config;
    }

    addAction(operationType: PolicyActionOperationType, dataId: string, fieldName?: string) {
        const { batch } = this;
        const entityName = createEntityName(dataId, fieldName);
        const batchEntryForEntity = batch[entityName];

        // If multiple operations come in for the same entityName such as multiple evictions of the same entity,
        // de-dupe them and prioritize them by ranked operation types
        if (!batchEntryForEntity || batchEntryForEntity.operationType > operationType) {
            batch[entityName] = {
                operationType,
                dataId,
                fieldName,
            }
        }
    }

    run() {
        const { cacheOperations: { evict } } = this.config;
        Object.values(this.batch).forEach(batchEntity => {
            const { dataId, fieldName } = batchEntity;
            if (batchEntity.operationType === PolicyActionOperationType.Evict) {
                evict(dataId, fieldName);
            }
        })
        this.batch = {};
    }
}