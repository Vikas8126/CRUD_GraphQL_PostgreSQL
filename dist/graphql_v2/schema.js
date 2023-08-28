"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const typeDefs = (0, apollo_server_express_1.gql) `
  type AuthType {
    token: String
    user: User
  }

  type Movie {
    user: User
    creatorId: Int
    description: String
    directorName: String
    id: Int
    name: String
    releaseDate: String
  }

  enum sort {
    DESC
    ASC
  }

  type User {
    email: String
    id: Int
    password: String
    userName: String
  }

  type movies {
    movies: [Movie]
    total_rows: Int
  }

  input sortOrder {
    column: String
    order: sort
  }

  type Query {
    movies(
      id: Int
      page: Int
      rows: Int
      sort: sortOrder
      search: String
    ): movies
  }

  type Mutation {
    createMovie(
      description: String!
      directorName: String!
      name: String!
      releaseDate: String!
    ): Movie
    
    deleteMovie(id: Int!): Movie

    updateMovie(
      idToUpdated: Int!
      description: String!
      directorName: String!
      name: String!
      releaseDate: String!
    ): Movie

    signupUser(userName: String!, email: String!, password: String!): AuthType
    loginUser(email: String!, password: String!): AuthType
  }
`;
exports.default = typeDefs;
//# sourceMappingURL=schema.js.map