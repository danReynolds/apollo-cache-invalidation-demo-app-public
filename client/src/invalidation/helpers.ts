const FieldNamePattern = /^[_A-Za-z0-9]+/;
export function fieldNameFromStoreFieldName(storeFieldName: string) {
  const match = storeFieldName.match(FieldNamePattern);
  return match && match[0];
}
