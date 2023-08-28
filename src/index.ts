import { ApolloServer } from "apollo-server";
import { Context } from "./types/context";
import { auth } from "./middleware/auth";
import { resolvers } from "./graphql/resolvers";
import typeDefs from "./graphql/schema"; // Import your schema

const boot = async () => {
  const server = new ApolloServer({      //Creating the apollo server
    typeDefs,                            //Passing the schema and resolvers to the server
    resolvers,
    context: ({ req }): Context => {
      const token = req?.headers?.authorization    //Passing the user id to the context from the auth token
        ? auth(req.headers.authorization)
        : null;
      return { userId: token?.userId };
    },
  });
  server.listen(5005).then(({ url }) => {           //Starting the server
    console.log(`Server is running at ${url}`);
  });
};

boot();
