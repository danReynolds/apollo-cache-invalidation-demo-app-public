import { ApolloClient, InMemoryCache } from "@apollo/client";
import { persistCache } from "apollo-cache-persist";
import { InvalidationPolicyCache } from "@nerdwallet/apollo-invalidation-policies";
const cache = new InvalidationPolicyCache({
  invalidationPolicies: {
    CreateEmployeeResponse: {
      onWrite: {
        EmployeesResponse: ({ modify, evict }, { fieldName }) => {
          evict({ fieldName });
        },
      },
    },
    EmployeesResponse: {
      ttl: 5000,
      onEvict: {
        Employee: ({ evict }, { id }) => {
          if (id === "10") {
            evict({ id });
          }
        },
      },
    },
  },
});

// persistCache({
//   cache,
//   storage: window.localStorage,
// });

export default new ApolloClient({
  uri: "http://localhost:4000",
  cache,
});
