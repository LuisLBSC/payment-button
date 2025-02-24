"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAuthStatus = exports.validateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const validateJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.header('auth-token') || '';
    if (!token) {
        return res.status(401).json({
            msg: 'No Autenticado'
        });
    }
    try {
        jsonwebtoken_1.default.verify(token, process.env.SECRETKEY || '');
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(401).json({
            msg: 'Token inválido'
        });
    }
});
exports.validateJWT = validateJWT;
const validateAuthStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.header('auth-token') || '';
    if (!token) {
        return res.status(401).json({
            msg: 'No Autenticado'
        });
    }
    try {
        const validateToken = jsonwebtoken_1.default.verify(token, process.env.SECRETKEY || '');
        if (!validateToken)
            return res.status(400).json({ msg: 'Token inválido', error: true, records: 0, data: [] });
        const registeredUser = yield prisma.user.findUnique({ where: { email: validateToken } });
        return res.status(200).json({
            msg: 'Autenticado',
            user: registeredUser
        });
    }
    catch (error) {
        console.log(error);
        return res.status(401).json({
            msg: 'Token inválido'
        });
    }
});
exports.validateAuthStatus = validateAuthStatus;
//# sourceMappingURL=validate-jwt.js.map