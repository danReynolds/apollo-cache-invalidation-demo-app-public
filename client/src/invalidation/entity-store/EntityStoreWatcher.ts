import { StoreObject } from "@apollo/client";
import EntityTypeMap from "./EntityTypeMap";

interface EntityStoreWatcherConfig {
  entityStore: any;
  entityTypeMap: EntityTypeMap;
}

export default class EntityStoreWatcher {
  private config: EntityStoreWatcherConfig;

  constructor(config: EntityStoreWatcherConfig) {
    this.config = config;

    this.watchEvict();
    this.watchMerge();
  }

  watchEvict() {
    const watcher = this;
    const {
      config: { entityStore, entityTypeMap }
    } = watcher;
    const { evict: originalEvict } = entityStore;

    entityStore.evict = function watchEvict(dataId: string, fieldName?: string) {
      const evicted = originalEvict.call(entityStore, dataId, fieldName);
      entityTypeMap.evict(dataId, fieldName);
      return evicted;
    }
  }

  watchMerge() {
    const watcher = this;
    const {
      config: { entityStore, entityTypeMap }
    } = watcher;
    const { merge: originalMerge } = entityStore;

    entityStore.merge = function watchMerge(
      dataId: string,
      incomingStoreEntities: StoreObject
    ) {
      if (dataId === "ROOT_QUERY" || dataId === "ROOT_MUTATION") {
        Object.keys(incomingStoreEntities)
          .filter(
            storeFieldName =>
              // If there is a valid response, it will contain the type Query and then the nested response types for each requested field. We want
              // to record a map of the types for those fields to their field store names. If there is no incoming data it is because that cache entry for storeFieldName
              // is being deleted so do nothing
              storeFieldName !== "__typename" &&
              // @ts-ignore
              incomingStoreEntities[storeFieldName]?.__typename
          )
          .forEach(storeFieldName => {
              const typenameForField = incomingStoreEntities[storeFieldName]!
              // @ts-ignore
              .__typename;
            entityTypeMap.write(typenameForField, dataId, storeFieldName);
          });
      } else {
        const [typenameForField] = dataId.split(":");
        // If the incoming data is empty, the dataId entry in the cache is being deleted so do nothing
        if (dataId && incomingStoreEntities.__typename) {
          entityTypeMap.write(typenameForField, dataId);
        }
      }
      return originalMerge.call(entityStore, dataId, incomingStoreEntities);
    };
  }
}
