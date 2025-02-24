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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserById = exports.updateUserById = exports.saveUser = exports.getUserByUsername = exports.getUserById = exports.getAllUsers = void 0;
const client_1 = require("@prisma/client");
const password_1 = require("../helpers/password");
const prisma = new client_1.PrismaClient();
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({ where: { active: 1 } });
        const usersWithoutPassword = users.map(user => {
            const { password } = user, userWithoutPassword = __rest(user, ["password"]);
            return userWithoutPassword;
        });
        res.json({
            msg: 'ok',
            error: false,
            records: usersWithoutPassword.length,
            data: usersWithoutPassword
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error obteniendo usuarios',
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
            res.status(404).json({ msg: 'Usuario no encontrado', error: false, data: [] });
        else {
            const { password } = existingUser, userWithoutPassword = __rest(existingUser, ["password"]);
            res.json({
                msg: 'ok',
                error: false,
                records: 1,
                data: userWithoutPassword
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error obteniendo usuario',
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
            res.status(404).json({ msg: 'Usuario no encontrado', error: false, data: [] });
        }
        else {
            const { password } = existingUser, userWithoutPassword = __rest(existingUser, ["password"]);
            res.json({
                msg: 'ok',
                error: false,
                records: 1,
                data: userWithoutPassword
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error obteniendo usuario',
            error: error,
            data: []
        });
    }
});
exports.getUserByUsername = getUserByUsername;
const saveUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, email, name, middlename, lastname, phone, address, country, postCode, profileId } = req.body;
        const encryptedPassword = yield (0, password_1.encryptPassword)(password);
        const newUser = yield prisma.user.upsert({
            create: {
                username,
                password: encryptedPassword,
                email,
                name,
                middlename,
                lastname,
                phone,
                address,
                country,
                postCode,
                profileId,
                active: 1
            },
            update: {
                username,
                password: encryptedPassword,
                email,
                name,
                middlename,
                lastname,
                phone,
                address,
                country,
                postCode,
                active: 1
            },
            where: { username }
        });
        const { password: _ } = newUser, userWithoutPassword = __rest(newUser, ["password"]);
        res.json({
            userWithoutPassword,
            msg: `Usuario ${newUser.username} creado`
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Ha ocurrido un error al crear el usuario: ',
            error
        });
    }
});
exports.saveUser = saveUser;
const updateUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        const { username, password, email, name, middlename, lastname, phone, address, country, postCode, profileId } = req.body;
        if (!id || isNaN(idNumber))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const existingUser = yield prisma.user.findFirst({ where: { id: idNumber } });
        if (!existingUser)
            res.status(404).json({ msg: 'Usuario no encontrado', error: false, data: [] });
        const updateData = {};
        if (username)
            updateData.username = username;
        if (password)
            updateData.password = yield (0, password_1.encryptPassword)(password);
        if (email)
            updateData.email = email;
        if (name)
            updateData.name = name;
        if (middlename)
            updateData.middlename = middlename;
        if (lastname)
            updateData.lastname = lastname;
        if (phone)
            updateData.phone = phone;
        if (address)
            updateData.address = address;
        if (country)
            updateData.country = country;
        if (postCode)
            updateData.postCode = postCode;
        if (profileId)
            updateData.profileId = profileId;
        if (!password) {
            delete updateData.password;
        }
        const updatedUser = yield prisma.user.update({
            where: {
                id: idNumber
            },
            data: updateData
        });
        const { password: _ } = updatedUser, userWithoutPassword = __rest(updatedUser, ["password"]);
        res.status(200).json({
            userWithoutPassword,
            msg: `Usuario ${updatedUser.username} actualizado`,
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
        yield prisma.user.delete({
            where: {
                id: idNumber
            }
        });
        res.status(200).json({
            msg: `Usuario ${id} eliminado`,
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