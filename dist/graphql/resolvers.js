"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const argon2_1 = __importDefault(require("argon2"));
const jwt = __importStar(require("jsonwebtoken"));
var sort;
(function (sort) {
    sort[sort["DESC"] = 0] = "DESC";
    sort[sort["ASC"] = 1] = "ASC";
})(sort || (sort = {}));
var movieColoumn;
(function (movieColoumn) {
    movieColoumn[movieColoumn["name"] = 0] = "name";
    movieColoumn[movieColoumn["id"] = 1] = "id";
    movieColoumn[movieColoumn["releaseDate"] = 2] = "releaseDate";
    movieColoumn[movieColoumn["directorName"] = 3] = "directorName";
    movieColoumn[movieColoumn["description"] = 4] = "description";
})(movieColoumn || (movieColoumn = {}));
exports.resolvers = {
    Query: {
        async movies(_, args, context) {
            var _a, _b;
            try {
                const rows = (args === null || args === void 0 ? void 0 : args.rows) || 10;
                const page = (args === null || args === void 0 ? void 0 : args.page) || 0;
                console.log(args, context);
                let db_query = {
                    skip: page * rows,
                    take: rows,
                    where: {},
                    include: {
                        user: true,
                    },
                };
                if (args === null || args === void 0 ? void 0 : args.id) {
                    db_query.where = { id: args === null || args === void 0 ? void 0 : args.id };
                }
                if ((args === null || args === void 0 ? void 0 : args.sort) && (args === null || args === void 0 ? void 0 : args.sort.column) && ((_a = args === null || args === void 0 ? void 0 : args.sort) === null || _a === void 0 ? void 0 : _a.order)) {
                    db_query.orderBy = {
                        [(_b = args === null || args === void 0 ? void 0 : args.sort) === null || _b === void 0 ? void 0 : _b.column]: (args === null || args === void 0 ? void 0 : args.sort.order).toString().toLowerCase(),
                    };
                }
                if (args === null || args === void 0 ? void 0 : args.search) {
                    db_query.where = {
                        OR: [
                            {
                                directorName: { contains: args === null || args === void 0 ? void 0 : args.search, mode: "insensitive" },
                            },
                            {
                                name: { contains: args === null || args === void 0 ? void 0 : args.search, mode: "insensitive" },
                            },
                            {
                                description: { contains: args === null || args === void 0 ? void 0 : args.search, mode: "insensitive" },
                            },
                        ],
                    };
                }
                const movies = await prismaClient_1.default.movie.findMany(db_query);
                const total_rows = await prismaClient_1.default.movie.count({
                    where: db_query.where,
                });
                return {
                    movies,
                    total_rows,
                };
            }
            catch (err) {
                return err;
            }
        },
    },
    Mutation: {
        async createMovie(_, args, context) {
            try {
                console.log(context);
                const user_id = context === null || context === void 0 ? void 0 : context.userId;
                if (!user_id) {
                    throw new Error("User is not logged in OR not authenticated");
                }
                const newMovie = await prismaClient_1.default.movie.create({
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
            }
            catch (err) {
                console.error(err);
                throw err;
            }
        },
        async updateMovie(_, args, context) {
            try {
                const user_id = context === null || context === void 0 ? void 0 : context.userId;
                if (!user_id) {
                    throw new Error("User is not logged in OR not authenticated");
                }
                const updatedMovie = await prismaClient_1.default.movie.update({
                    where: {
                        id: args.idToUpdated,
                    },
                    data: {
                        name: args.name,
                        description: args.description,
                        directorName: args.directorName,
                        releaseDate: args.releaseDate,
                        image: args.image,
                        updatedAt: new Date(),
                    },
                });
                return updatedMovie;
            }
            catch (err) {
                console.error(err);
                throw err;
            }
        },
        async deleteMovie(_, args, context) {
            try {
                const user_id = context === null || context === void 0 ? void 0 : context.userId;
                if (!user_id) {
                    throw new Error("User is not logged in OR not authenticated");
                }
                const deletedMovie = await prismaClient_1.default.movie.delete({
                    where: {
                        id: args.id,
                    },
                });
                return deletedMovie;
            }
            catch (err) {
                console.error(err);
                throw err;
            }
        },
        async signupUser(_, args, context) {
            try {
                const { userName, email, password } = args;
                const hashedPassword = await argon2_1.default.hash(password);
                console.log(context);
                const user = await prismaClient_1.default.user.create({
                    data: {
                        userName,
                        email,
                        password: hashedPassword,
                    },
                });
                console.log(user);
                const token = jwt.sign({ userId: user.id }, process.env.TOKEN_SECRET, { expiresIn: "1d" });
                return { user, token };
            }
            catch (err) {
                console.error(err);
                throw err;
            }
        },
        async loginUser(_, args, context) {
            try {
                const { email, password } = args;
                console.log(context);
                const user = await prismaClient_1.default.user.findUnique({ where: { email } });
                if (!user) {
                    throw new Error("User not found");
                }
                const isValid = await argon2_1.default.verify(user.password, password);
                if (!isValid) {
                    throw new Error("Invalid password");
                }
                const token = jwt.sign({ userId: user.id }, process.env.TOKEN_SECRET, { expiresIn: "1d" });
                return { user, token };
            }
            catch (err) {
                console.error(err);
                throw err;
            }
        },
        async editPassword(_, args, context) {
            try {
                const user_id = context === null || context === void 0 ? void 0 : context.userId;
                if (!user_id) {
                    throw new Error("User is not logged in OR not authenticated");
                }
                const { userId, oldPassword, newPassword } = args;
                console.log(context);
                const user = await prismaClient_1.default.user.findUnique({ where: { id: userId } });
                if (!user) {
                    throw new Error("User not found");
                }
                const isOldPasswordValid = await argon2_1.default.verify(user.password, oldPassword);
                if (!isOldPasswordValid) {
                    throw new Error("Invalid old password");
                }
                const hashedNewPassword = await argon2_1.default.hash(newPassword);
                const updatedUser = await prismaClient_1.default.user.update({
                    where: { id: userId },
                    data: { password: hashedNewPassword },
                });
                const token = jwt.sign({ userId: updatedUser.id }, process.env.TOKEN_SECRET, { expiresIn: "1d" });
                console.log(updatedUser);
                return { user: updatedUser, token };
            }
            catch (err) {
                console.error(err);
                throw err;
            }
        },
    },
};
//# sourceMappingURL=resolvers.js.map