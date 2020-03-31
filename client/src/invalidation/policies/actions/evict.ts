import { PolicyActionMeta, PolicyActionOperations } from '../types';
import { ReadDataResult } from '../../EntityStoreProxy';

export function evict(predicate: Function) {
    return ({ evict }: PolicyActionOperations, entryResult: ReadDataResult, meta: PolicyActionMeta) => {
        const { dataId, fieldName, data } = entryResult;

        if (!predicate || predicate(data, meta)) {
            evict(dataId, fieldName);
        }
    }
}