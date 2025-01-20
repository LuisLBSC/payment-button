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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserById = exports.updateUserById = exports.saveUser = exports.getUserByUsername = exports.getUserById = exports.getAllUsers = void 0;
const client_1 = require("@prisma/client");
const password_1 = require("../helpers/password");
const prisma = new client_1.PrismaClient();
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({ where: { active: 1 } });
        res.json({
            msg: 'ok',
            error: false,
            records: users.length,
            data: users
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting users',
            error
        });
    }
});
exports.getAllUsers = getAllUsers;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const existingUser = yield prisma.user.findFirst({ where: { id: idNumber } });
        if (!existingUser)
            res.status(404).json({ msg: 'User not found', error: false, data: [] });
        else {
            res.json({
                msg: 'ok',
                error: false,
                records: 1,
                data: existingUser
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting user',
            error: error,
            data: []
        });
    }
});
exports.getUserById = getUserById;
const getUserByUsername = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.body;
        if (!username)
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const existingUser = yield prisma.user.findFirst({ where: { username } });
        if (!existingUser) {
            res.status(404).json({ msg: 'User not found', error: false, data: [] });
        }
        else {
            res.json({
                msg: 'ok',
                error: false,
                records: 1,
                data: existingUser
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting user',
            error: error,
            data: []
        });
    }
});
exports.getUserByUsername = getUserByUsername;
const saveUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, name, lastname, email, profileId } = req.body;
        const encryptedPassword = yield (0, password_1.encryptPassword)(password);
        const newUser = yield prisma.user.upsert({
            create: { username, password: encryptedPassword, email, name, lastname, profileId, active: 1 },
            update: { username, password: encryptedPassword, email, name, lastname, profileId, active: 1 },
            where: { username }
        });
        res.json({
            newUser,
            msg: `User ${newUser.username} created`
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error
        });
    }
});
exports.saveUser = saveUser;
const updateUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        const { username, password, email, name, lastname, profileId } = req.body;
        const encryptedPassword = yield (0, password_1.encryptPassword)(password);
        ;
        if (!id || isNaN(idNumber))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const existingUser = yield prisma.user.findFirst({ where: { id: idNumber } });
        if (!existingUser)
            res.status(404).json({ msg: 'User not found', error: false, data: [] });
        const updatedUser = yield prisma.user.update({
            where: {
                id: idNumber
            },
            data: {
                username,
                password: encryptedPassword,
                email,
                name,
                lastname,
                profileId,
            }
        });
        res.status(200).json({
            updatedUser,
            msg: `User ${username} updated`,
            error: false,
            records: 1
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error
        });
    }
});
exports.updateUserById = updateUserById;
const deleteUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        yield prisma.user.update({
            where: {
                id: idNumber
            },
            data: {
                active: 0
            }
        });
        res.status(200).json({
            msg: `User ${id} deleted`,
            error: false
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error
        });
    }
});
exports.deleteUserById = deleteUserById;
//# sourceMappingURL=user.js.map