import _ from "lodash";
import { InMemoryCache } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";

let dirty = false;

const FieldNamePattern = /^[_A-Za-z0-9]+/;
export function fieldNameFromfieldStoreName(storeFieldName) {
  const match = storeFieldName.match(FieldNamePattern);
  return match && match[0];
}

export default class InvalidationInMemoryCache extends InMemoryCache {
  constructor(props) {
    super(props);
    this.typesToStoreEntries = {};
    this.storeEntriesToTypes = {};

    this.watchStoreChanges();
  }

  write(options) {
    const { query } = options;
    const definition = getMainDefinition(query);
    const operationName =
      (definition && definition.name && definition.name.value) || "";
    debugger;

    const writeResults = Object.values(options.result).forEach(resultValue => {
      const { __typename: resultValueType } = resultValue;
      if (resultValueType === "CreateEmployeeResponse") {
        debugger;
        this.evict("Employee:1");
        //   this.group.dirty(dataId, )
        // this.data.delete('employees({"filter":"Employee query 0"})');
      }
    });
    return super.write(options);
  }

  // TODO:
  evict(dataId, fieldName) {
    const evicted = super.evict(dataId, fieldName);

    if (evicted) {
      const type = _.get(
        this.storeEntriesToTypes,
        _.compact([dataId, fieldName])
      );
      // Get invalidation policies type, run its onEvict
    }

    return evicted;
  }

  watchStoreChanges() {
    const {
      storeEntriesToTypes,
      typesToStoreEntries,
      data: entityStore
    } = this;
    const { merge } = entityStore;
    this.data.merge = function trackedMerge(dataId, incoming) {
      if (dataId === "ROOT_QUERY" || dataId === "ROOT_MUTATION") {
        Object.keys(incoming)
          .filter(
            fieldStoreName =>
              // If there is a valid response, it will contain the type Query and then the nested response types for each requested field. We want
              // to record a map of the types for those fields to their field store names. If there is no incoming data it is because that cache entry for fieldStoreName
              // is being deleted so do nothing
              fieldStoreName !== "__typename" && incoming[fieldStoreName]
          )
          .forEach(fieldStoreName => {
            const typenameForField = incoming[fieldStoreName].__typename;
            const fieldName = fieldNameFromfieldStoreName(fieldStoreName);
            const storeIdentifier = `${dataId}:${fieldName}`;
            _.setWith(
              typesToStoreEntries,
              [typenameForField, dataId, fieldName],
              true,
              Object
            );
            _.setWith(
              storeEntriesToTypes,
              [dataId, fieldName],
              typenameForField,
              Object
            );
          });
      } else {
        const [typenameForField] = dataId.split(":");
        // If the incoming data is empty, the dataId entry in the cache is being deleted so do nothing
        if (dataId && incoming.__typename) {
          _.setWith(
            typesToStoreEntries,
            [typenameForField, dataId],
            true,
            Object
          );
          storeEntriesToTypes[dataId] = typenameForField;
        }
      }
      console.log(typesToStoreEntries, storeEntriesToTypes);
      return merge.call(entityStore, dataId, incoming);
    };
  }
}

/*
Example Config:

const cache = new InvalidationInMemoryCache({
    typePolicies: {...},
    fieldPolicies: {...},
    invalidationPolicies: {
        CreateFinancialPortalResponse: {
          onStore: {
            FinancialPortalsResponse: push(),
          },
        },
        DeleteFinancialPortalResponse: {
          onStore: {
            FinancialPortalsResponse: invalidate(),
          },
        }
    }
})
*/
