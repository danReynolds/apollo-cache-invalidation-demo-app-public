import _ from "lodash";
import gql from "graphql-tag";
import InvalidationInMemoryCache from "../";
import Employee from "./fixtures/employee";

describe("Cache", () => {
  let cache: InvalidationInMemoryCache;

  const [employee, employee2, employee3] = _.times(3, () => Employee());

  const employeesQuery = gql`
    query {
      employees {
        data {
          id
          employee_name
          employee_salary
          employee_age
        }
      }
    }
  `;

  const createEmployeeMutation = gql`
    query {
      createEmployee {
        data {
          id
          employee_name
          employee_salary
          employee_age
        }
      }
    }
  `;

  const employeesResponse = {
    employees: {
      __typename: "EmployeesResponse",
      data: [employee, employee2]
    }
  };

  const createEmployeeResponse = {
    createEmployee: {
      __typename: "CreateEmployeeResponse",
      data: employee3
    }
  };

  describe("with an Evict onWrite cache policy", () => {
    beforeEach(() => {
      cache = new InvalidationInMemoryCache({
        invalidationPolicies: {
          CreateEmployeeResponse: {
            onWrite: {
              Employee: ({ evict }, { dataId, fieldName }) =>
                evict(dataId, fieldName)
            }
          }
        }
      });
      cache.writeQuery({
        query: employeesQuery,
        data: employeesResponse
      });
    });

    test("should evict the child entities on parent write", () => {
      cache.writeQuery({
        query: createEmployeeMutation,
        data: createEmployeeResponse
      });
      expect(cache.extract(true)).toEqual({
        [employee3.toRef()]: employee3,
        ROOT_QUERY: {
          __typename: "Query",
          createEmployee: {
            __typename: "CreateEmployeeResponse",
            data: { __ref: employee3.toRef() }
          },
          employees: {
            __typename: "EmployeesResponse",
            data: [{ __ref: employee.toRef() }, { __ref: employee2.toRef() }]
          }
        }
      });
    });
  });

  describe("with a cascading Evict onWrite cache policy", () => {
    beforeEach(() => {
      cache = new InvalidationInMemoryCache({
        invalidationPolicies: {
          CreateEmployeeResponse: {
            onWrite: {
              EmployeesResponse: ({ evict }, { dataId, fieldName }) =>
                evict(dataId, fieldName)
            },
          },
          EmployeesResponse: {
            onEvict: {
              Employee: ({ evict }, { dataId, fieldName }) =>
                evict(dataId, fieldName)
            }
          }
        }
      });
      cache.writeQuery({
        query: employeesQuery,
        data: employeesResponse
      });
    });

    test("should evict cascaded child entities on write", () => {
      cache.writeQuery({
        query: createEmployeeMutation,
        data: createEmployeeResponse
      });
      expect(cache.extract(true)).toEqual({
        [employee3.toRef()]: employee3,
        ROOT_QUERY: {
          __typename: "Query",
          createEmployee: {
            __typename: "CreateEmployeeResponse",
            data: { __ref: employee3.toRef() }
          },
        }
      });
    });
  });
});
