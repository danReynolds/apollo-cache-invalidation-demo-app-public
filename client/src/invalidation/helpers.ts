import _ from 'lodash';

const FieldNamePattern = /^[_A-Za-z0-9]+/;
export function fieldNameFromStoreFieldName(storeFieldName: string) {
  const match = storeFieldName.match(FieldNamePattern);
  return match && match[0];
}

export function createEntityName(dataId: string, fieldName?: string | null): string {
  return _.compact([dataId, fieldName]).join('.');
}