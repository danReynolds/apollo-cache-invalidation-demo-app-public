import _ from "lodash";
import React, { useCallback, useState } from "react";
import gql from "graphql-tag";
import { useLazyQuery, useMutation } from "@apollo/client";
import logo from "./logo.svg";
import "./App.css";
import { employeeNameGetter, cache } from "./ApolloClient";

const employeesQuery = gql`
  query GetEmployees($filter: String, $otherFilter: String) {
    employees(filter: $filter, otherFilter: $otherFilter) {
      data {
        id
        first_name
        last_name
      }
      status
    }
    bosses(filter: $filter, otherFilter: $otherFilter) {
      data {
        id
        first_name
        last_name
      }
      status
    }
  }
`;

const createEmployeeQuery = gql`
  mutation CreateEmployee(
    $email: String!
    $first_name: String!
    $last_name: String!
  ) {
    createEmployee(
      email: $email
      first_name: $first_name
      last_name: $last_name
    ) {
      data {
        id
        employee_name
      }
    }
  }
`;

let x = 0;

function App() {
  const [employeeQueryNumber, setEmployeeQueryNumber] = useState(0);
  const [createdEmployeeIndex, setCreatedEmployeeIndex] = useState(0);

  const [
    makeEmployeesQuery,
    { data: employeesData, loading, error },
  ] = useLazyQuery(employeesQuery, {
    fetchPolicy: "cache-first",
    onCompleted: () => {
      cache.auditLog.printLog({
        meta: {
          storeFieldName: "employees({})",
        },
      });
    },
  });
  const [
    createEmployee,
    {
      data: createEmployeeData,
      loading: createEmployeeLoading,
      error: createEmployeeError,
    },
  ] = useMutation(createEmployeeQuery, {
    optimisticResponse: {
      __typename: "Mutation",
      createEmployee: {
        __typename: "CreateEmployeeResponse",
        test: true,
      },
    },
  });

  const handlePressEmployeesQueryButton = useCallback(() => {
    makeEmployeesQuery();
    setEmployeeQueryNumber(employeeQueryNumber + 1);
  }, [makeEmployeesQuery, setEmployeeQueryNumber, employeeQueryNumber]);

  const handlePressCreateEmployeeButton = useCallback(() => {
    console.log(createdEmployeeIndex);
    createEmployee({
      variables: {
        employee_name: `Test employee ${createdEmployeeIndex}`,
        employee_salary: `${createdEmployeeIndex}`,
        employee_age: `${createdEmployeeIndex}`,
      },
    });
    setCreatedEmployeeIndex(createdEmployeeIndex + 1);
  }, [createEmployee, setCreatedEmployeeIndex, createdEmployeeIndex]);

  const employees = _.get(employeesData, "employees.data", []);
  const employeeStatus = _.get(employeesData, "employees.status");
  const bosses = _.get(employeesData, "bosses.data", []);
  const bossesStatus = _.get(employeesData, "bosses.status");

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <button onClick={handlePressEmployeesQueryButton}>
          Employees query
        </button>
        <button onClick={handlePressCreateEmployeeButton}>
          Create employee
        </button>
        <button onClick={() => employeeNameGetter(`Test name ${x++}`)}>
          Update employee names
        </button>
        <h2>{`Employees ${employeeStatus}`}</h2>
        {employees.map((employee) => (
          <div
            key={employee.id}
          >{`${employee.first_name} ${employee.last_name}`}</div>
        ))}
        <h2>{`Bosses ${bossesStatus}`}</h2>
        {bosses.map((boss) => (
          <div key={boss.id}>{`${boss.first_name} ${boss.last_name}`}</div>
        ))}
      </header>
    </div>
  );
}

export default App;
