import React, { useCallback, useState } from "react";
import gql from "graphql-tag";
import { useLazyQuery, useMutation } from "@apollo/client";
import logo from "./logo.svg";
import "./App.css";

const employeesQuery = gql`
  query GetEmployees($filter: String, $otherFilter: String) {
    managers: employees(filter: $filter, otherFilter: $otherFilter) {
      data {
        id
        employee_name
      }
    }
    bosses(filter: $filter, otherFilter: $otherFilter) {
      data {
        id
      }
    }
  }
`;

const createEmployeeQuery = gql`
  mutation CreateEmployee(
    $employee_name: String!
    $employee_salary: String!
    $employee_age: String!
  ) {
    createEmployee(
      employee_name: $employee_name
      employee_salary: $employee_salary
      employee_age: $employee_age
    ) {
      data {
        id
        employee_name
      }
    }
  }
`;

function App() {
  const [employeeQueryNumber, setEmployeeQueryNumber] = useState(0);
  const [createdEmployeeIndex, setCreatedEmployeeIndex] = useState(0);

  const [makeEmployeesQuery, { data, loading, error }] = useLazyQuery(
    employeesQuery
  );
  const [
    createEmployee,
    {
      data: createEmployeeData,
      loading: createEmployeeLoading,
      error: createEmployeeError
    }
  ] = useMutation(createEmployeeQuery, {
    optimisticResponse: {
      __typename: "Mutation",
      createEmployee: {
        __typename: "CreateEmployeeResponse",
        test: x++
      }
    }
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
        employee_age: `${createdEmployeeIndex}`
      }
    });
    setCreatedEmployeeIndex(createdEmployeeIndex + 1);
  }, [createEmployee, setCreatedEmployeeIndex, createdEmployeeIndex]);

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
      </header>
    </div>
  );
}

export default App;
