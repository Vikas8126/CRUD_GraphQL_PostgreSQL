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
exports.userAuth = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const argon2_1 = __importDefault(require("argon2"));
const jwt = __importStar(require("jsonwebtoken"));
exports.userAuth = {
    Mutation: {
        async signupUser(_, args, context) {
            try {
                const { userName, email, password } = args;
                const hashedPassword = await argon2_1.default.hash(password);
                console.log(context);
                const user = await prismaClient_1.default.user.create({
                    data: {
                        userName,
                        email,
                        password: hashedPassword
                    }
                });
                console.log(user);
                const token = jwt.sign({ userId: user.id }, process.env.TOKEN_SECRET);
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
                    throw new Error('User not found');
                }
                const isValid = await argon2_1.default.verify(user.password, password);
                if (!isValid) {
                    throw new Error('Invalid password');
                }
                const token = jwt.sign({ userId: user.id }, process.env.TOKEN_SECRET);
                return { user, token };
            }
            catch (err) {
                console.error(err);
                throw err;
            }
        }
    }
};
//# sourceMappingURL=auth.js.map