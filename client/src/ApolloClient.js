import { ApolloClient, InMemoryCache, makeVar } from "@apollo/client";
import { persistCache } from "apollo-cache-persist";
import { InvalidationPolicyCacheAuditor } from "apollo-invalidation-policies";

export const employeeNameGetter = makeVar("test");

export const cache = new InvalidationPolicyCacheAuditor({
  typePolicies: {
    // Employee: {
    //   fields: {
    //     __typename: {
    //       read(_, { variables }) {
    //         return employeeNameGetter();
    //       },
    //       merge(args1, args2, args3) {
    //         debugger;
    //         return args1;
    //       },
    //     },
    //   },
    // },
    Employee: {
      fields: {
        first_name: {
          read(existingName, { storage }) {
            debugger;
            if (!storage.name) {
              storage.name = existingName;
            }
          },
          merge(existingName, incomingName, { storage }) {
            debugger;
            console.log(storage);
            return incomingName;
          },
        },
      },
    },
  },
  invalidationPolicies: {
    timeToLive: 5000,
    types: {
      // EmployeesResponse: {
      // onWrite: {
      //   Employee: ({ modify, readField }, meta) => {
      //     debugger;
      //     const x = readField(meta.parent.ref, meta.parent.storeFieldName);
      //     modify({
      //       id: meta.id,
      //       fields: {
      //         first_name: (currentFirstName) => {
      //           return "Test";
      //         },
      //       },
      //     });
      //   },
      // },
      // },
      // CreateEmployeeResponse: {
      // onWrite: {
      //   EmployeesResponse: ({ modify, evict }, { fieldName }) => {
      //     debugger;
      //     evict({ fieldName });
      //   },
      // },
      // },
      // EmployeesResponse: {
      //   timeToLive: 10000,
      //   onEvict: {
      //     Employee: ({ evict }, { id }) => {
      //       if (id === "10") {
      //         evict({ id });
      //       }
      //     },
      //   },
      // },
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
