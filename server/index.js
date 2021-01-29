const { ApolloServer, gql } = require("apollo-server");
const { RESTDataSource } = require("apollo-datasource-rest");

const API_ROUTE = "https://reqres.in/api";

let status = 0;
let employeeId = 0;

// The GraphQL schema
const typeDefs = gql`
  type Employee {
    id: ID!
    email: String!
    first_name: String!
    last_name: String!
    avatar: String
  }

  type EmployeesResponse {
    status: Int!
    data: [Employee!]!
  }

  type CreateEmployeeResponse {
    data: Employee!
  }

  type Query {
    employees(filter: String, otherFilter: String): EmployeesResponse!
    bosses(filter: String, otherFilter: String): EmployeesResponse
  }

  type Mutation {
    createEmployee(
      email: String!
      first_name: String!
      last_name: String!
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
    },
  },
  Mutation: {
    createEmployee: (parent, args, { dataSources }, options) => {
      return dataSources.employeesAPI.createEmployee(args);
    },
  },
};

class EmployeesAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = API_ROUTE;
  }

  async getEmployees() {
    const response = await this.get(`${API_ROUTE}/users`);
    return {
      ...response,
      status: status++,
    };
  }

  async createEmployee(data) {
    const {
      email,
      first_name,
      last_name
    } = data;
    employeeId += 1;
    return {
      data: {
        id: `created-employee-${employeeId}`,
        email,
        first_name: 'Dan',
        last_name: 'Reynolds'
      },
    };
  }
}

const dataSources = {
  employeesAPI: new EmployeesAPI(),
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => dataSources,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
