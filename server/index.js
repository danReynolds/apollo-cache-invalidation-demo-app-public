const { ApolloServer, gql } = require("apollo-server");

const API_ROUTE = "http://dummy.restapiexample.com/api/v1/employees";

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

  type Query {
    employees: EmployeesResponse
  }
`;

const resolvers = {
  Query: {
    employees: () => fetch(API_ROUTE)
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
