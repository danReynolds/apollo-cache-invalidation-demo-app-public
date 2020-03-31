import _ from 'lodash';
import { StoreObject } from "@apollo/client";
import { createEntityName, fieldNameFromStoreFieldName } from './helpers';

interface EntityName {
    dataId: string;
    fieldName: string;
    storeFieldNames: {
        [index: string]: boolean;
    }
}

interface TypesToEntityNames {
    [index: string]: {
        [index: string]: EntityName
    };
}

interface EntityNamesToTypes {
    [index: string]: string
}

interface EntityStoreProxyConfig {
    entityStore: any;
}

interface ReadTypeResult {
    [index: string]: EntityName,
}

export interface ReadDataResult {
    dataId: string;
    fieldName?: string;
    storeFieldName?: string;
    data: any;
}

class EntityNameMap {
    private typesToEntityNames: TypesToEntityNames = {};
    private entityNamesToTypes: EntityNamesToTypes = {};

    write(typename: string, dataId: string, storeFieldName?: string | null) {
        const fieldName = storeFieldName ?  fieldNameFromStoreFieldName(storeFieldName) : null;
        const entityName = createEntityName(dataId, fieldName);
        const typeToEntityName = _.get(this.typesToEntityNames, [typename, entityName]);

        if (typeToEntityName) {
            if (storeFieldName) {
                _.setWith(typeToEntityName, ['storeFieldNames', storeFieldName], true);
            }
        } else {
            _.setWith(this.typesToEntityNames, [typename, entityName], {
                dataId,
                fieldName,
                storeFieldNames: storeFieldName ? {
                    [storeFieldName]: true
                } : null,
            })
        }

        this.entityNamesToTypes[entityName] = typename;
        console.log(this.typesToEntityNames, this.entityNamesToTypes);
        return true;
    }

    evict(dataId: string, fieldName?: string) {
        const entityName = createEntityName(dataId, fieldName);
        const typeName = this.entityNamesToTypes[entityName];

        delete this.typesToEntityNames[typeName][entityName];
        delete this.entityNamesToTypes[entityName];

        return true;
    }

    readEntitiesForType(typeName: string): ReadTypeResult {
        return this.typesToEntityNames[typeName];
    }

    readTypeForEntity(dataId: string, fieldName: string): string {
        return this.entityNamesToTypes[createEntityName(dataId, fieldName)];
    }
}

export default class EntityStoreProxy {
    private entityNameMap = new EntityNameMap();
    private entityStore: any;

    constructor(config: EntityStoreProxyConfig) {
        const { entityStore } = config;
        this.entityStore = entityStore;

        this.setupProxies();
    }

    setupProxies() {
        const proxy = this;
        const { entityStore } = proxy;
        const { merge: originalMerge } = entityStore;
        
        entityStore.merge = function proxyMerge(dataId: string, incomingStoreEntities: StoreObject) {
          proxy.merge(dataId, incomingStoreEntities);
          return originalMerge.call(entityStore, dataId, incomingStoreEntities);
        };
    }

    merge(dataId: string, incomingStoreEntities: StoreObject) {
        if (dataId === "ROOT_QUERY" || dataId === "ROOT_MUTATION") {
            Object.keys(incomingStoreEntities)
            .filter(
              storeFieldName =>
                // If there is a valid response, it will contain the type Query and then the nested response types for each requested field. We want
                // to record a map of the types for those fields to their field store names. If there is no incoming data it is because that cache entry for storeFieldName
                // is being deleted so do nothing
                // @ts-ignore
                storeFieldName !== "__typename" && incomingStoreEntities[storeFieldName]?.__typename
            )
            .forEach(storeFieldName => {
            // @ts-ignore
              const typenameForField = incomingStoreEntities[storeFieldName]!.__typename;
              this.entityNameMap.write(typenameForField, dataId, storeFieldName);
            });
        } else {
            const [typenameForField] = dataId.split(":");
            // If the incoming data is empty, the dataId entry in the cache is being deleted so do nothing
            if (dataId && incomingStoreEntities.__typename) {
                this.entityNameMap.write(typenameForField, dataId);
            }
        }
    }

    evict(dataId: string, fieldName?: string) {
        this.entityNameMap.evict(dataId, fieldName);
        console.log(`Evicted ${dataId}:${fieldName} from name map`);
    }

    private readDataEntriesForMeta(entityMeta: EntityName) {
        const { dataId, fieldName, storeFieldNames } = entityMeta;
        if (!fieldName) {
            return [
                {
                    dataId,
                    data: this.entityStore.lookup(dataId),
                }
            ];
        }
        return [
            ...Object.keys(storeFieldNames).map(storeFieldName => ({
                dataId,
                fieldName,
                storeFieldName,
                data: this.entityStore.get(dataId, storeFieldName),
            }))
        ];
    }

    readDataForType(typeName: string): ReadDataResult[] {
        const entityNames = this.entityNameMap.readEntitiesForType(typeName) ?? [];
        return Object.values(entityNames).reduce<ReadDataResult[]>((acc, entityMeta) => {
            return [
                ...acc,
                ...this.readDataEntriesForMeta(entityMeta),
            ]
        }, [])
    }

    readDataForEntity(dataId: string, fieldName: string): ReadDataResult[] {
        const entityName = createEntityName(dataId, fieldName);
        const typeName = this.entityNameMap.readTypeForEntity(dataId, fieldName);
        const entityMeta = this.entityNameMap.readEntitiesForType(typeName)[entityName];
        return this.readDataEntriesForMeta(entityMeta);
    }
}