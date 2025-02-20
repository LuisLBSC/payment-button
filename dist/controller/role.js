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
exports.deleteRoleById = exports.updateRoleById = exports.saveRole = exports.getRoleById = exports.getAllRoles = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield prisma.role.findMany({ include: { entities: { include: { entity: true } } } });
        res.json({
            msg: 'ok',
            error: false,
            records: roles.length,
            data: roles
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error obteniendo roles',
            error
        });
    }
});
exports.getAllRoles = getAllRoles;
const getRoleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const existingRole = yield prisma.role.findFirst({ where: { id: idNumber }, include: { entities: { include: { entity: true } } } });
        if (!existingRole)
            res.status(404).json({ msg: 'Rol no encontrado', error: false, data: [] });
        res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: existingRole
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error obteniendo rol',
            error: error,
            data: []
        });
    }
});
exports.getRoleById = getRoleById;
const saveRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, active, entityIds } = req.body;
        const existingRole = yield prisma.role.findUnique({
            where: { name },
            include: { entities: true }
        });
        if (existingRole) {
            const existingEntityIds = existingRole === null || existingRole === void 0 ? void 0 : existingRole.entities.map(entity => entity.entityId);
            const newEntityIds = entityIds.filter((entityId) => !(existingEntityIds === null || existingEntityIds === void 0 ? void 0 : existingEntityIds.includes(entityId)));
            if (newEntityIds.length > 0) {
                const updatedRole = yield prisma.role.update({
                    where: { name },
                    data: {
                        description,
                        active: 1,
                        entities: {
                            create: newEntityIds.map((entityId) => ({ entityId }))
                        }
                    }
                });
                res.json({
                    updatedRole,
                    msg: `Rol ${updatedRole.name} actualizado y nuevas entidades asignadas`
                });
            }
            else {
                const updatedRole = yield prisma.role.update({
                    where: { name },
                    data: {
                        description,
                        active: 1
                    }
                });
                res.json({
                    updatedRole,
                    msg: `Rol ${updatedRole.name} actualizado con entidades existentes`
                });
            }
        }
        else {
            const newRole = yield prisma.role.create({
                data: {
                    name,
                    description,
                    entities: {
                        create: entityIds.map((entityId) => ({ entityId }))
                    }
                }
            });
            res.json({
                newRole,
                msg: `Rol ${newRole.name} creado con roles`
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Something went wrong',
            error
        });
    }
});
exports.saveRole = saveRole;
const updateRoleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        const { name, description, active, entityIds } = req.body;
        if (!id || isNaN(idNumber))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const updatingRole = yield prisma.role.findFirst({ where: { id: idNumber }, include: { entities: true } });
        if (!updatingRole)
            res.status(404).json({ msg: 'Rol no encontrado', error: false, data: [] });
        const existingEntityIds = updatingRole === null || updatingRole === void 0 ? void 0 : updatingRole.entities.map(entity => entity.entityId);
        const newEntityIds = entityIds.filter((entityId) => !(existingEntityIds === null || existingEntityIds === void 0 ? void 0 : existingEntityIds.includes(entityId)));
        if (newEntityIds.length > 0) {
            const updatingRole = yield prisma.role.update({
                where: {
                    id: idNumber
                },
                data: {
                    description,
                    active: 1,
                    entities: {
                        create: newEntityIds.map((entityId) => ({ entityId }))
                    }
                }
            });
            res.status(200).json({
                updatingRole,
                msg: `Rol ${updatingRole.name} actualizado y nuevas entidades asignadas`,
                error: false
            });
        }
        else {
            const updatingRole = yield prisma.role.update({
                where: {
                    id: idNumber
                },
                data: {
                    description,
                    active: 1
                }
            });
            res.status(200).json({
                updatingRole,
                msg: `Rol ${updatingRole.name} actualizado con entidades existentes`
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error
        });
    }
});
exports.updateRoleById = updateRoleById;
const deleteRoleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const roleExists = yield prisma.role.findUnique({
            where: { id: idNumber },
        });
        if (!roleExists) {
            return res.status(404).json({
                msg: `Rol con id ${idNumber} no encontrado`,
                error: true,
                records: 0,
                data: [],
            });
        }
        yield prisma.role.update({
            where: {
                id: idNumber
            },
            data: {
                active: 0
            }
        });
        yield prisma.roleEntity.deleteMany({
            where: { roleId: idNumber }
        });
        res.status(200).json({
            msg: `Rol ${id} eliminado y sus detalles también fueron eliminados`,
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
exports.deleteRoleById = deleteRoleById;
//# sourceMappingURL=role.js.map