import { PolicyActionMeta, PolicyActionOperations } from '../types';
import { EntityDataResult } from '../../entity-store/types';

export function evict(shouldEvict: Function) {
    return ({ evict }: PolicyActionOperations, entryResult: EntityDataResult, meta: PolicyActionMeta) => {
        const { dataId, fieldName, data } = entryResult;

        if (!shouldEvict || shouldEvict(data, meta)) {
            evict(dataId, fieldName, data);
        }
    }
}