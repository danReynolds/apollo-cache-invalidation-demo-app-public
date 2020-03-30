import _ from 'lodash';
import { StoreObject } from "@apollo/client";
import { fieldNameFromStoreFieldName } from './helpers';

interface TypesToStoreEntities {
    [index: string]: {
        [index: string]: {
            [index: string]: boolean
        }
    };
}

interface storeEntitiesToTypes {
    [index: string]: {
        [index: string]: object;
    }
}


class EntityStoreTypeMap {
    private typesToStoreEntities: TypesToStoreEntities = {};
    private storeEntitiesToTypes: storeEntitiesToTypes = {};

    write(typename: string, dataId: string, fieldName?: string | null) {
        _.setWith(this.typesToStoreEntities, _.compact([typename, dataId, fieldName]), true, Object);
        _.setWith(this.storeEntitiesToTypes, _.compact([dataId, fieldName]), typename, Object)
        console.log(this.typesToStoreEntities, this.storeEntitiesToTypes);
        return true;
    }

    evict(dataId: string, fieldName?: string) {
        const typename = _.get(this.storeEntitiesToTypes, _.compact([dataId, fieldName]));
        if (fieldName) {
            delete this.storeEntitiesToTypes[dataId][fieldName];
            delete this.typesToStoreEntities[typename][dataId][fieldName];
        } else {
            delete this.storeEntitiesToTypes[dataId];
            delete this.typesToStoreEntities[typename][dataId];
        }
        return true;
    }
}

export default class EntityStoreEventManager {
    private entityStoreMap = new EntityStoreTypeMap();

    onMerge(dataId: string, incomingStoreEntities: StoreObject) {
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
              const fieldName = fieldNameFromStoreFieldName(storeFieldName);
              this.entityStoreMap.write(typenameForField, dataId, fieldName);
            });
        } else {
            const [typenameForField] = dataId.split(":");
            // If the incoming data is empty, the dataId entry in the cache is being deleted so do nothing
            if (dataId && incomingStoreEntities.__typename) {
                this.entityStoreMap.write(typenameForField, dataId);
            }
        }
    }

    onEvict(dataId: string, fieldName?: string) {
        this.entityStoreMap.evict(dataId, fieldName);
    }
}