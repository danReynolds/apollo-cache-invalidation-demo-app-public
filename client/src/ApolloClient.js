import { ApolloClient, InMemoryCache } from "@apollo/client";
import { evict, write } from "./invalidation/policies/actions";
import InvalidationInMemoryCache from "./invalidation";

export default new ApolloClient({
  uri: "http://localhost:4000",
  cache: new InvalidationInMemoryCache({
    invalidationPolicies: {
      CreateEmployeeResponse: {
        onWrite: {
          EmployeesResponse: evict()
        }
      },
      EmployeesResponse: {
        onEvict: {
          Employee: write(data => ({ ...data, worked: true }))
        }
      }
    }
  })
});
