"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
var sort;
(function (sort) {
    sort[sort["DESC"] = 0] = "DESC";
    sort[sort["ASC"] = 1] = "ASC";
})(sort || (sort = {}));
exports.resolvers = {
    Query: {
        async movies(_, args, context) {
            var _a;
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
                if (args === null || args === void 0 ? void 0 : args.sort) {
                    db_query.orderBy = {
                        [(_a = args === null || args === void 0 ? void 0 : args.sort) === null || _a === void 0 ? void 0 : _a.column]: (args === null || args === void 0 ? void 0 : args.sort.order).toString().toLowerCase(),
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
                const newMovie = await prismaClient_1.default.movie.create({
                    data: {
                        name: args.name,
                        description: args.description,
                        directorName: args.directorName,
                        creatorId: 3,
                        createdAt: new Date(),
                        updatedAt: new Date(),
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
        async updateMovie(_, args) {
            try {
                const updatedMovie = await prismaClient_1.default.movie.update({
                    where: {
                        id: args.idToUpdated,
                    },
                    data: {
                        name: args.name,
                        description: args.description,
                        directorName: args.directorName,
                        releaseDate: args.releaseDate,
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
        async deleteMovie(_, args) {
            try {
                const deletedMovie = await prismaClient_1.default.movie.delete({
                    where: {
                        id: args.id
                    },
                });
                return deletedMovie;
            }
            catch (err) {
                console.error(err);
                throw err;
            }
        },
    },
};
//# sourceMappingURL=resolvers.js.map