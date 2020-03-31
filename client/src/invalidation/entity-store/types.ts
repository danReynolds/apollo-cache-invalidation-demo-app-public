export interface TypeMapEntity {
    dataId: string;
    fieldName: string;
    storeFieldNames: {
        [index: string]: boolean;
    }
}

export interface EntityDataResult {
    dataId: string;
    fieldName?: string;
    storeFieldName?: string;
    data: any;
}