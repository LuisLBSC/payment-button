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
        const roles = yield prisma.role.findMany({ where: { active: 1 }, include: { roleDetails: true } });
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
            msg: 'Error getting roles',
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
        const existingRole = yield prisma.role.findFirst({ where: { id: idNumber }, include: { roleDetails: true } });
        if (!existingRole)
            res.status(404).json({ msg: 'Role not found', error: false, data: [] });
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
            msg: 'Error getting role',
            error: error,
            data: []
        });
    }
});
exports.getRoleById = getRoleById;
const saveRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, entities } = req.body;
        if (!Array.isArray(entities)) {
            return res.status(400).json({
                msg: "roleDetails must be an array of entity names",
            });
        }
        const newRole = yield prisma.role.upsert({
            create: { name, description },
            update: { name, description },
            where: { name }
        });
        for (const entity of entities) {
            yield prisma.roleDetail.upsert({
                create: {
                    roleId: newRole.id,
                    entity,
                },
                update: {
                    active: 1,
                },
                where: {
                    roleId_entity: {
                        roleId: newRole.id,
                        entity,
                    },
                },
            });
        }
        res.json({
            newRole,
            msg: `Role ${newRole.name} created`
        });
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
        const { name, description, entities } = req.body;
        if (!id || isNaN(idNumber))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const updatingRole = yield prisma.role.findFirst({ where: { id: idNumber } });
        if (!updatingRole)
            res.status(404).json({ msg: 'Role not found', error: false, data: [] });
        const updatedRole = yield prisma.role.update({
            where: { id: idNumber },
            data: { name, description },
        });
        if (Array.isArray(entities)) {
            const currentRoleDetails = yield prisma.roleDetail.findMany({
                where: { roleId: idNumber },
            });
            const currentEntities = currentRoleDetails.map((rd) => rd.entity);
            for (const entity of entities) {
                yield prisma.roleDetail.upsert({
                    where: {
                        roleId_entity: {
                            roleId: idNumber,
                            entity,
                        },
                    },
                    update: {
                        active: 1,
                    },
                    create: {
                        roleId: idNumber,
                        entity,
                    },
                });
            }
            const entitiesToDeactivate = currentEntities.filter((entity) => !entities.includes(entity));
            yield prisma.roleDetail.updateMany({
                where: {
                    roleId: idNumber,
                    entity: { in: entitiesToDeactivate },
                },
                data: { active: 0 },
            });
        }
        res.status(200).json({
            msg: `Role ${updatedRole.name} updated`,
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
                msg: `Role with id ${idNumber} not found`,
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
        yield prisma.roleDetail.updateMany({
            where: { roleId: idNumber },
            data: { active: 0 },
        });
        res.status(200).json({
            msg: `Role ${id} deleted and its details were deleted too`,
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