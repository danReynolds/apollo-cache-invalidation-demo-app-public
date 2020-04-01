import { ApolloClient, InMemoryCache } from "@apollo/client";
import InvalidationInMemoryCache from "./invalidation";

export default new ApolloClient({
  uri: "http://localhost:4000",
  cache: new InvalidationInMemoryCache({
    invalidationPolicies: {
      CreateEmployeeResponse: {
        onWrite: {
          EmployeesResponse: ({ modify, evict }, cacheEntry) => {
            const {
              dataId,
              fieldName,
              storeFieldName,
              data,
              parent
            } = cacheEntry;
            modify(dataId, {
              [fieldName]: (entry, options) => {
                return {
                  ...entry,
                  data: entry.data.slice(0, 5)
                };
              }
            });
          },
          Employee: ({ evict }, cacheEntry) => {
            const { dataId, fieldName, data } = cacheEntry;
            if (data.id === "10") {
              evict(dataId, fieldName);
            }
          }
        }
      }
    }
  })
});
