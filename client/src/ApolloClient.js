import { ApolloClient, InMemoryCache } from "@apollo/client";
import InvalidationInMemoryCache from "./invalidation-policies";

export default new ApolloClient({
  uri: "http://localhost:4000",
  cache: new InvalidationInMemoryCache()
});
