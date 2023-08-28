"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const auth_1 = require("./middleware/auth");
const resolvers_1 = require("./graphql/resolvers");
const schema_1 = __importDefault(require("./graphql/schema"));
const boot = async () => {
    const server = new apollo_server_1.ApolloServer({
        typeDefs: schema_1.default,
        resolvers: resolvers_1.resolvers,
        context: ({ req }) => {
            var _a;
            const token = ((_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a.authorization)
                ? (0, auth_1.auth)(req.headers.authorization)
                : null;
            return { userId: token === null || token === void 0 ? void 0 : token.userId };
        },
    });
    server.listen(5005).then(({ url }) => {
        console.log(`Server is running at ${url}`);
    });
};
boot();
//# sourceMappingURL=index.js.map