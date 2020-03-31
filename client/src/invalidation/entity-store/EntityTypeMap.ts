import _ from 'lodash';
import { makeEntityId, fieldNameFromStoreFieldName } from '../helpers';
import { TypeMapEntity } from './types';

interface TypesToEntities {
    [index: string]: {
        [index: string]: TypeMapEntity
    };
}

interface EntitiesToTypes {
    [index: string]: string
}

interface TypeMapEntities {
    [index: string]: TypeMapEntity,
}

export interface EntityDataResult {
    dataId: string;
    fieldName?: string;
    storeFieldName?: string;
    data: any;
}

export default class EntityTypeMap {
    private typesToEntities: TypesToEntities = {};
    private entitiesToTypes: EntitiesToTypes = {};

    write(typename: string, dataId: string, storeFieldName?: string | null) {
        const fieldName = storeFieldName ?  fieldNameFromStoreFieldName(storeFieldName) : null;
        const entityName = makeEntityId(dataId, fieldName);
        const typeToEntityName = _.get(this.typesToEntities, [typename, entityName]);

        if (typeToEntityName) {
            if (storeFieldName) {
                _.setWith(typeToEntityName, ['storeFieldNames', storeFieldName], true);
            }
        } else {
            _.setWith(this.typesToEntities, [typename, entityName], {
                dataId,
                fieldName,
                storeFieldNames: storeFieldName ? {
                    [storeFieldName]: true
                } : null,
            })
        }

        this.entitiesToTypes[entityName] = typename;
        console.log(this.typesToEntities, this.entitiesToTypes);
        return true;
    }

    evict(dataId: string, fieldName?: string) {
        const entityName = makeEntityId(dataId, fieldName);
        const typeName = this.entitiesToTypes[entityName];

        delete this.typesToEntities[typeName][entityName];
        delete this.entitiesToTypes[entityName];

        return true;
    }

    readEntitiesByType(typeName: string): TypeMapEntities {
        return this.typesToEntities[typeName];
    }

    readTypeByEntityId(dataId: string, fieldName?: string): string {
        return this.entitiesToTypes[makeEntityId(dataId, fieldName)];
    }
}