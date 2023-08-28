import { Prisma } from "@prisma/client";
import dbClient from "../prismaClient";
import { Context } from "../types/context";
import argon2 from "argon2";
import * as jwt from "jsonwebtoken";

enum sort { //importing the enum from the schema for asc and desc
  DESC,
  ASC,
}

enum movieColoumn { //importing the enum from the schema for the column names
  name,
  id,
  releaseDate,
  directorName,
  description,
}

export const resolvers = {
  //resolvers for the queries and mutations
  Query: {
    async movies(
      //query for getting all the movies
      _: any,
      args: {
        //arguments for the query
        id: number;
        page: number;
        rows: number;
        sort: { column: movieColoumn; order: sort };
        search: string;
      },
      context: Context
    ) {
      try {
        const rows = args?.rows || 10;
        const page = args?.page || 0;
        console.log(args, context);
        let db_query: Prisma.movieFindManyArgs = {
          skip: page * rows,
          take: rows,
          where: {},
          include: {
            user: true,
          },
        };
        if (args?.id) {
          // Filter movie by ID
          db_query.where = { id: args?.id };
        }
        if (args?.sort && args?.sort.column && args?.sort?.order) {
          // Sort Data as per the column passed
          db_query.orderBy = {
            [args?.sort?.column]: (args?.sort.order).toString().toLowerCase(),
          };
        }
        if (args?.search) {
          // Seach as per the string passed
          db_query.where = {
            OR: [
              {
                directorName: { contains: args?.search, mode: "insensitive" }, //Search by director name
              },
              {
                name: { contains: args?.search, mode: "insensitive" }, //Search by movie name
              },
              {
                description: { contains: args?.search, mode: "insensitive" }, //Search by description
              },
            ],
          };
        }
        const movies = await dbClient.movie.findMany(db_query); //Querying the database
        const total_rows = await dbClient.movie.count({
          //Counting the total number of rows
          where: db_query.where,
        });

        return {
          //Returning the movies and total rows
          movies,
          total_rows,
        };
      } catch (err) {
        return err;
      }
    },
  },

  Mutation: {
    //Mutation for creating a new movie
    async createMovie(
      _: any,
      args: {
        description: string;
        image: string;
        name: string;
        directorName: string;
        releaseDate: string;
      },
      context: Context
    ) {
      try {
        console.log(context);
        const user_id = context?.userId; //Checking if the user is logged in and authenticated
        if (!user_id) {
          throw new Error("User is not logged in OR not authenticated");
        }
        const newMovie = await dbClient.movie.create({
          //Creating a new movie in the database
          data: {
            name: args.name,
            description: args.description,
            directorName: args.directorName,
            creatorId: 3,
            createdAt: new Date(),
            updatedAt: new Date(),
            image: args.image,
            releaseDate: args.releaseDate,
          },
        });
        return newMovie;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },

    // Mutation for updating a movie
    async updateMovie(
      _: any,
      args: {
        idToUpdated: number;
        image: string;
        description: string;
        name: string;
        directorName: string;
        releaseDate: string;
      },
      context: Context
    ) {
      try {
        const user_id = context?.userId; //Checking if the user is logged in and authenticated
        if (!user_id) {
          throw new Error("User is not logged in OR not authenticated");
        }
        const updatedMovie = await dbClient.movie.update({
          //Updating the movie in the database by id
          where: {
            id: args.idToUpdated,
          },
          data: {
            //passing the data from arguemnts
            name: args.name,
            description: args.description,
            directorName: args.directorName,
            releaseDate: args.releaseDate,
            image: args.image,
            updatedAt: new Date(),
          },
        });
        return updatedMovie;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },

    async deleteMovie(_: any, args: { id: number }, context: Context) {
      //Mutation for deleting a movie
      try {
        const user_id = context?.userId; //Checking if the user is logged in and authenticated
        if (!user_id) {
          throw new Error("User is not logged in OR not authenticated");
        }
        const deletedMovie = await dbClient.movie.delete({
          //Deleting the movie in the database by id
          where: {
            id: args.id,
          },
        });
        return deletedMovie;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },

    // Mutation for signing up a user with jwt token and hashing the password
    async signupUser(
      _: any,
      args: { userName: string; email: string; password: string },
      context: Context
    ) {
      try {
        const { userName, email, password } = args;
        const hashedPassword = await argon2.hash(password); //Hashing the password with argon2
        console.log(context);
        const user = await dbClient.user.create({
          //Creating a new user in the database
          data: {
            userName,
            email,
            password: hashedPassword,
          },
        });
        console.log(user);

        //Creating a jwt token for 24 hours
        const token = jwt.sign(
          { userId: user.id },
          process.env.TOKEN_SECRET as jwt.Secret,
          { expiresIn: "1d" }
        );
        return { user, token };
      } catch (err) {
        console.error(err);
        throw err;
      }
    },

    // Mutation for logging in a user with jwt token and hashing the password encryption
    async loginUser(
      _: any,
      args: { email: string; password: string },
      context: Context
    ) {
      try {
        const { email, password } = args;
        console.log(context);
        const user = await dbClient.user.findUnique({ where: { email } });
        if (!user) {
          throw new Error("User not found");
        }
        const isValid = await argon2.verify(user.password, password);
        if (!isValid) {
          throw new Error("Invalid password");
        }
        const token = jwt.sign(
          { userId: user.id },
          process.env.TOKEN_SECRET as jwt.Secret,
          { expiresIn: "1d" }
        );
        return { user, token };
      } catch (err) {
        console.error(err);
        throw err;
      }
    },

    // Mutation for editing the password of a user
    async editPassword(
      _: any,
      args: { userId: number; oldPassword: string; newPassword: string },
      context: Context
    ) {
      try {
        const user_id = context?.userId; //Checking if the user is logged in and authenticated
        if (!user_id) {
          throw new Error("User is not logged in OR not authenticated");
        }
        const { userId, oldPassword, newPassword } = args;
        console.log(context);
        const user = await dbClient.user.findUnique({ where: { id: userId } }); // Find the user by ID
        if (!user) {
          throw new Error("User not found");
        }
        const isOldPasswordValid = await argon2.verify(
          user.password,
          oldPassword
        ); // Verify the old password
        if (!isOldPasswordValid) {
          throw new Error("Invalid old password");
        }
        const hashedNewPassword = await argon2.hash(newPassword); // Hash the new password
        const updatedUser = await dbClient.user.update({
          // Update the user's password
          where: { id: userId },
          data: { password: hashedNewPassword },
        });
        // Generate a new token
        const token = jwt.sign(
          { userId: updatedUser.id },
          process.env.TOKEN_SECRET as jwt.Secret,
          { expiresIn: "1d" }
        );
        console.log(updatedUser);
        return { user: updatedUser, token };
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
  },
};
