import { ApolloClient, InMemoryCache } from "@apollo/client";
import { persistCache } from "apollo-cache-persist";
import { InvalidationPolicyCache } from "apollo-cache-invalidation";

const cache = new InvalidationPolicyCache({
  invalidationPolicies: {
    CreateEmployeeResponse: {
      onWrite: {
        EmployeesResponse: ({ modify, evict }, cacheEntry) => {
          const {
            dataId,
            fieldName,
            storeFieldName,
            data,
            parent,
          } = cacheEntry;
          modify(dataId, {
            [fieldName]: (entry, options) => {
              return {
                ...entry,
                data: entry.data.slice(0, 5),
              };
            },
          });
        },
      },
    },
    EmployeesResponse: {
      onEvict: {
        Employee: ({ evict }, cacheEntry) => {
          const { dataId, fieldName, data } = cacheEntry;
          if (data.id === "10") {
            evict(dataId, fieldName);
          }
        },
      },
    },
  },
});

persistCache({
  cache,
  storage: window.localStorage,
});

export default new ApolloClient({
  uri: "http://localhost:4000",
  cache,
});
