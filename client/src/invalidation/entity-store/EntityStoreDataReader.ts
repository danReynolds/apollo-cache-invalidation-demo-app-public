import EntityTypeMap from "./EntityTypeMap";
import { makeEntityId } from '../helpers';
import { EntityDataResult, TypeMapEntity } from './types';

interface EntityStoreDataReaderConfig {
    entityStore: any;
    entityTypeMap: EntityTypeMap;
}

export default class EntityStoreDataReader {
    private config: EntityStoreDataReaderConfig;

    constructor(config: EntityStoreDataReaderConfig) {
        this.config = config;
    }

    private readStoreByEntity(entity: TypeMapEntity) {
        const { dataId, fieldName, storeFieldNames } = entity;
        const { entityStore } = this.config;

        if (!fieldName) {
            return [
                {
                    dataId,
                    data: entityStore.lookup(dataId),
                }
            ];
        }
        return [
            ...Object.keys(storeFieldNames).map(storeFieldName => ({
                dataId,
                fieldName,
                storeFieldName,
                data: entityStore.get(dataId, storeFieldName),
            }))
        ];
    }

    readStoreByType(typeName: string): EntityDataResult[] {
        const entities = this.config.entityTypeMap.readEntitiesByType(typeName) ?? [];
        return Object.values(entities).reduce<EntityDataResult[]>((acc, entityValue) => {
            return [
                ...acc,
                ...this.readStoreByEntity(entityValue),
            ]
        }, [])
    }

    readStoreByEntityId(dataId: string, fieldName: string): EntityDataResult[] {
        const { entityTypeMap } = this.config;
        const entityId = makeEntityId(dataId, fieldName);
        const typeName = entityTypeMap.readTypeByEntityId(dataId, fieldName);
        const entity = entityTypeMap.readEntitiesByType(typeName)[entityId];
        return this.readStoreByEntity(entity);
    }
}