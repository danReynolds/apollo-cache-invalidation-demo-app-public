import { ApolloClient, InMemoryCache, makeVar } from "@apollo/client";
import { persistCache } from "apollo-cache-persist";
import { InvalidationPolicyCache } from "apollo-invalidation-policies";
import { ApolloLink, Observable } from 'apollo-link';
export const employeeNameGetter = makeVar(0);

let x = 0;

export const cache = new InvalidationPolicyCache({
  typePolicies: {
    Query: {
      fields: {
        employeesTypePolicy: {
          read(_current, { readField }) {
            const y = readField({ fieldName: 'bosses', args: {} });
            return y;
          }
        },
        bossesTypePolicy: {
          read(_current, { readField }) {
            const y = readField('employeesTypePolicy');
            console.log("bossesTypePolicy");
            return y;
          }
        }
      }
    }
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
      CreateEmployeeResponse: {
        onWrite: {
          EmployeesResponse: ({ modify, readField }, { fieldName, storeFieldName, parent }) => {
            debugger;
            const createEmployeeResponse = readField({
              fieldName: parent.fieldName,
              from: parent.ref,
              args: parent.variables,
            });
            modify({
              fields: {
                [storeFieldName]: (employeesResponse) => {
                  return {
                    ...employeesResponse,
                    data: [
                      ...employeesResponse.data,
                      createEmployeeResponse.data,
                    ]
                  }
                }
              }
            })
          },
        },
      },
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
