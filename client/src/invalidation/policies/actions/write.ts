import { PolicyAction } from '../types';

export function write(writeFunction: Function): PolicyAction {
    return ({ modify }, entityData, actionMeta) => {
        const { dataId, fieldName, data } = entityData;

        if (!writeFunction) {
            return;
        }
        
        const updatedData = writeFunction(data, actionMeta);

        modify(dataId, updatedData);
    }
}