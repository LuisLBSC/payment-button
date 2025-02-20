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
exports.saveEntitiesWithRoles = exports.getEntitiesWithRoles = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getEntitiesWithRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const entities = yield prisma.entity.findMany({
            include: {
                RoleEntity: {
                    include: {
                        role: true
                    }
                }
            }
        });
        const entitiesWithRoles = entities.map((entity) => {
            return {
                id: entity.id,
                name: entity.name,
                description: entity.description,
                roles: entity.RoleEntity.map((roleEntity) => ({
                    id: roleEntity.role.id,
                    name: roleEntity.role.name,
                    description: roleEntity.role.description
                }))
            };
        });
        res.json(entitiesWithRoles);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Something went wrong',
            error
        });
    }
});
exports.getEntitiesWithRoles = getEntitiesWithRoles;
const saveEntitiesWithRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const entities = req.body;
        const entitiesWithRoles = [];
        for (const entityData of entities) {
            const { name, description, roles } = entityData;
            const entity = yield prisma.entity.upsert({
                where: { name },
                update: {
                    description,
                    active: 1,
                },
                create: {
                    name,
                    description,
                    active: 1,
                },
            });
            const rolesWithInfo = [];
            for (const roleData of roles) {
                const { name: roleName, description: roleDescription } = roleData;
                const role = yield prisma.role.create({
                    data: {
                        name: roleName,
                        description: roleDescription,
                        active: 1,
                    }
                });
                yield prisma.roleEntity.upsert({
                    where: {
                        roleId_entityId: {
                            roleId: role.id,
                            entityId: entity.id,
                        },
                    },
                    update: {},
                    create: {
                        roleId: role.id,
                        entityId: entity.id,
                    },
                });
                rolesWithInfo.push({
                    id: role.id,
                    name: role.name,
                    description: role.description,
                    active: role.active,
                });
            }
            entitiesWithRoles.push({
                id: entity.id,
                name: entity.name,
                description: entity.description,
                active: entity.active,
                roles: rolesWithInfo,
            });
        }
        res.json({
            msg: 'Entidades y roles creados/actualizados exitosamente',
            data: entitiesWithRoles,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Something went wrong',
            error,
        });
    }
});
exports.saveEntitiesWithRoles = saveEntitiesWithRoles;
//# sourceMappingURL=entityWithRoles.js.map