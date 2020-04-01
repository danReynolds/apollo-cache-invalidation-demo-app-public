import { PolicyAction, InvalidationPolicyCacheOperations } from '../types';

export function evict(shouldEvict: Function): PolicyAction {
    return ({ evict }, entityData, actionMeta) => {
        const { dataId, fieldName, data } = entityData;

        if (!shouldEvict || shouldEvict(data, actionMeta)) {
            evict(dataId, fieldName, data);
        }
    }
}