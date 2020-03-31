import { PolicyActionMeta, PolicyActionOperations } from '../types';
import { EntityDataResult } from '../../entity-store/types';

export function update(updater: Function) {
    return ({ modify }: PolicyActionOperations, entryResult: EntityDataResult, meta: PolicyActionMeta) => {
        const { dataId, fieldName, data } = entryResult;

        if (!updater) {
            return;
        }
        debugger;

        // For updating queries/mutations modify expects the 
        // if (dataId === 'ROOT_QUERY' || dataId === 'ROOT_MUTATION') {
        //     modify(dataId, {
        //         [meta.id]: () => updater(data, meta),
        //     })
        // } else {
        //     modify(dataId, updatedData);
        // }
    }
}