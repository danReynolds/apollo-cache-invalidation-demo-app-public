const { ApolloServer, gql } = require("apollo-server");
const { RESTDataSource } = require("apollo-datasource-rest");

const API_ROUTE = "http://dummy.restapiexample.com/api/v1";

// The GraphQL schema
const typeDefs = gql`
  type Employee {
    id: ID!
    employee_name: String!
    employee_salary: String!
    employee_age: String!
    profile_image: String!
  }

  type EmployeesResponse {
    status: String!
    data: [Employee!]!
  }

  type CreateEmployeeResponse {
    data: Employee!
  }

  type Query {
    employees(filter: String, otherFilter: String): EmployeesResponse
    bosses(filter: String, otherFilter: String): EmployeesResponse
  }

  type Mutation {
    createEmployee(
      employee_name: String!
      employee_salary: String!
      employee_age: String!
    ): CreateEmployeeResponse
  }
`;

const resolvers = {
  Query: {
    employees: (parent, args, { dataSources }, options) => {
      return dataSources.employeesAPI.getEmployees();
    },
    bosses: (parent, args, { dataSources }, options) => {
      return dataSources.employeesAPI.getEmployees();
    }
  },
  Mutation: {
    createEmployee: (parent, args, { dataSources }, options) => {
      return dataSources.employeesAPI.createEmployee(args);
    }
  }
};

class EmployeesAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = API_ROUTE;
  }

  getEmployees() {
    return this.get(`${API_ROUTE}/employees`);
  }

  async createEmployee(data) {
    const {
      employee_name: name,
      employee_salary: salary,
      employee_age: age
    } = data;
    const result = await this.post(`${API_ROUTE}/create`, {
      name,
      salary,
      age
    });
    return {
      data: {
        id: result.data.id,
        employee_name: result.data.name,
        employee_salary: result.data.salary,
        employee_age: result.data.age
      }
    };
  }
}

const dataSources = {
  employeesAPI: new EmployeesAPI()
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => dataSources
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
