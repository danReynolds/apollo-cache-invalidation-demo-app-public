import _ from "lodash";
import React, { useCallback, useState } from "react";
import gql from "graphql-tag";
import { useLazyQuery, useMutation } from "@apollo/client";
import logo from "./logo.svg";
import "./App.css";
import employee from "./invalidation/tests/fixtures/employee";

const employeesQuery = gql`
  query GetEmployees($filter: String, $otherFilter: String) {
    employees(filter: $filter, otherFilter: $otherFilter) {
      data {
        id
        employee_name
      }
    }
    bosses(filter: $filter, otherFilter: $otherFilter) {
      data {
        id
        employee_name
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

  const [
    makeEmployeesQuery,
    { data: employeesData, loading, error },
  ] = useLazyQuery(employeesQuery);
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
  const bosses = _.get(employeesData, "bosses.data", []);

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
        <h2>Employees</h2>
        {employees.map((employee) => (
          <div key={employee.id}>{employee.employee_name}</div>
        ))}
        <h2>Bosses</h2>
        {bosses.map((boss) => (
          <div key={employee.id}>{boss.employee_name}</div>
        ))}
      </header>
    </div>
  );
}

export default App;
