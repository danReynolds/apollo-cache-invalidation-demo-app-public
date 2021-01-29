import _ from "lodash";
import React, { useCallback, useState } from "react";
import gql from "graphql-tag";
import { useLazyQuery, useQuery, useMutation, useReactiveVar } from "@apollo/client";
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
  }
`;

const bossesQuery = gql`
  query GetBosses($filter: String, $otherFilter: String) {
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
      first_name
      last_name
    }
  }
}
`;

let x = 0;

function App() {
  const [employeeQueryNumber, setEmployeeQueryNumber] = useState(0);
  const [createdEmployeeIndex, setCreatedEmployeeIndex] = useState(0);

  const employeeIteration = useReactiveVar(employeeNameGetter);

  const { data: eagerEmployeesData } = useQuery(employeesQuery, {
    fetchPolicy: "cache-first",
  });

  const [
    makeEmployeesQuery,
    { data: employeesData, loading, error },
  ] = useLazyQuery(employeesQuery, {
    fetchPolicy: "cache-first",
  });

  const [
    makeBossesQuery,
    { data: bossesData },
  ] = useLazyQuery(bossesQuery, {
    fetchPolicy: "cache-first",
  });
  const [
    createEmployee,
    {
      data: createEmployeeData,
      loading: createEmployeeLoading,
      error: createEmployeeError,
    },
  ] = useMutation(createEmployeeQuery);

  const handlePressBossesQueryButton = useCallback(() => {
    makeBossesQuery();
    setEmployeeQueryNumber(employeeQueryNumber + 1);
  }, [makeBossesQuery, setEmployeeQueryNumber, employeeQueryNumber]);

  const handlePressEmployeesQueryButton = useCallback(() => {
    makeEmployeesQuery();
    x += 1;
    setEmployeeQueryNumber(employeeQueryNumber + 1);
  }, [makeEmployeesQuery, setEmployeeQueryNumber, employeeQueryNumber]);

  const handlePressCreateEmployeeButton = useCallback(() => {
    console.log(createdEmployeeIndex);
    createEmployee({
      variables: {
        email: `Test employee ${createdEmployeeIndex} `,
        first_name: `${createdEmployeeIndex} `,
        last_name: `${createdEmployeeIndex} `,
      },
    });
    setCreatedEmployeeIndex(createdEmployeeIndex + 1);
  }, [createEmployee, setCreatedEmployeeIndex, createdEmployeeIndex]);

  const handleEvictEmployeeButton = useCallback(() => {
    console.log(cache);
    cache.evict('Employee:1');
  });

  const employees = _.get(eagerEmployeesData, "employees.data", []);
  const employeeStatus = _.get(eagerEmployeesData, "employees.status");
  const bosses = _.get(bossesData, "bosses.data", []);
  const bossesStatus = _.get(bossesData, "bosses.status");

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <button onClick={handlePressEmployeesQueryButton}>
          Employees query
        </button>
        <button onClick={handlePressBossesQueryButton}>
          Bosses query
        </button>
        <button onClick={handlePressCreateEmployeeButton}>
          Create employee
        </button>
        <button onClick={handleEvictEmployeeButton}>
          Evict employee
        </button>
        <button onClick={() => employeeNameGetter(++x)}>
          {`Update employee names ${employeeIteration}`}
        </button>
        <h2>{`Employees ${employeeStatus} `}</h2>
        {employees.map((employee) => (
          <div
            key={employee.id}
          >{`${employee.first_name} ${employee.last_name} `}</div>
        ))}
        <h2>{`Bosses ${bossesStatus} `}</h2>
        {bosses.map((boss) => (
          <div key={boss.id}>{`${boss.first_name} ${boss.last_name} `}</div>
        ))}
      </header>
    </div>
  );
}

export default App;
