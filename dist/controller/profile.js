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
exports.deleteProfileById = exports.updateProfileById = exports.saveProfile = exports.getProfileById = exports.getAllProfiles = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllProfiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profiles = yield prisma.profile.findMany({
            where: { active: 1 },
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                entities: {
                                    include: {
                                        entity: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        const profilesWithEntities = profiles.map((profile) => {
            const entityMap = new Map();
            profile.roles.forEach((profileRole) => {
                profileRole.role.entities.forEach((roleEntity) => {
                    const entityId = roleEntity.entity.id;
                    if (!entityMap.has(entityId)) {
                        entityMap.set(entityId, {
                            id: roleEntity.entity.id,
                            name: roleEntity.entity.name,
                            description: roleEntity.entity.description,
                            active: roleEntity.entity.active,
                            roles: []
                        });
                    }
                    entityMap.get(entityId).roles.push({
                        id: profileRole.role.id,
                        name: profileRole.role.name,
                        description: profileRole.role.description,
                        active: profileRole.role.active
                    });
                });
            });
            return {
                id: profile.id,
                name: profile.name,
                description: profile.description,
                active: profile.active,
                entities: Array.from(entityMap.values())
            };
        });
        res.json({
            msg: 'ok',
            error: false,
            records: profilesWithEntities.length,
            data: profilesWithEntities
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting profiles',
            error
        });
    }
});
exports.getAllProfiles = getAllProfiles;
const getProfileById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const existingProfile = yield prisma.profile.findFirst({
            where: { id: idNumber },
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                entities: {
                                    include: {
                                        entity: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!existingProfile)
            res.status(404).json({ msg: 'Profile not found', error: false, data: [] });
        const entityMap = new Map();
        existingProfile === null || existingProfile === void 0 ? void 0 : existingProfile.roles.forEach((profileRole) => {
            profileRole.role.entities.forEach((roleEntity) => {
                const entityId = roleEntity.entity.id;
                if (!entityMap.has(entityId)) {
                    entityMap.set(entityId, {
                        id: roleEntity.entity.id,
                        name: roleEntity.entity.name,
                        description: roleEntity.entity.description,
                        active: roleEntity.entity.active,
                        roles: []
                    });
                }
                entityMap.get(entityId).roles.push({
                    id: profileRole.role.id,
                    name: profileRole.role.name,
                    description: profileRole.role.description,
                    active: profileRole.role.active
                });
            });
        });
        const profileWithEntities = {
            id: existingProfile === null || existingProfile === void 0 ? void 0 : existingProfile.id,
            name: existingProfile === null || existingProfile === void 0 ? void 0 : existingProfile.name,
            description: existingProfile === null || existingProfile === void 0 ? void 0 : existingProfile.description,
            active: existingProfile === null || existingProfile === void 0 ? void 0 : existingProfile.active,
            entities: Array.from(entityMap.values())
        };
        res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: profileWithEntities
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting profile',
            error: error,
            data: []
        });
    }
});
exports.getProfileById = getProfileById;
const saveProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, roleIds } = req.body;
        const existingProfile = yield prisma.profile.findUnique({
            where: { name },
            include: { roles: true }
        });
        if (existingProfile) {
            const existingRoleIds = existingProfile === null || existingProfile === void 0 ? void 0 : existingProfile.roles.map(role => role.roleId);
            const newRoleIds = roleIds.filter((roleId) => !(existingRoleIds === null || existingRoleIds === void 0 ? void 0 : existingRoleIds.includes(roleId)));
            if (newRoleIds.length > 0) {
                const updatedProfile = yield prisma.profile.update({
                    where: { name },
                    data: {
                        description,
                        active: 1,
                        roles: {
                            create: newRoleIds.map((roleId) => ({ roleId }))
                        }
                    }
                });
                res.json({
                    updatedProfile,
                    msg: `Profile ${updatedProfile.name} updated and new roles assigned`
                });
            }
            else {
                const updatedProfile = yield prisma.profile.update({
                    where: { name },
                    data: {
                        description,
                        active: 1
                    }
                });
                res.json({
                    updatedProfile,
                    msg: `Profile ${updatedProfile.name} updated with existing roles`
                });
            }
        }
        else {
            const newProfile = yield prisma.profile.create({
                data: {
                    name,
                    description,
                    roles: {
                        create: roleIds.map((roleId) => ({ roleId }))
                    }
                }
            });
            res.json({
                newProfile,
                msg: `Profile ${newProfile.name} created with roles`
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
exports.saveProfile = saveProfile;
const updateProfileById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        const { name, description, roleIds } = req.body;
        if (!id || isNaN(idNumber))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const updatingProfile = yield prisma.profile.findFirst({ where: { id: idNumber }, include: { roles: true } });
        if (!updatingProfile)
            res.status(404).json({ msg: 'Profile not found', error: false, data: [] });
        const existingRoleIds = updatingProfile === null || updatingProfile === void 0 ? void 0 : updatingProfile.roles.map(role => role.roleId);
        const newRoleIds = roleIds || [];
        const rolesToRemove = existingRoleIds === null || existingRoleIds === void 0 ? void 0 : existingRoleIds.filter(roleId => !newRoleIds.includes(roleId));
        const rolesToAdd = newRoleIds.filter((roleId) => !(existingRoleIds === null || existingRoleIds === void 0 ? void 0 : existingRoleIds.includes(roleId)));
        const updateData = {};
        if (name)
            updateData.name = name;
        if (description)
            updateData.description = description;
        updateData.active = 1;
        let msg = 'with existing roles';
        if (rolesToRemove && rolesToRemove.length > 0) {
            yield prisma.profileRole.deleteMany({
                where: {
                    profileId: idNumber,
                    roleId: { in: rolesToRemove },
                },
            });
        }
        if (rolesToAdd.length > 0) {
            yield prisma.profileRole.createMany({
                data: rolesToAdd.map((roleId) => ({ profileId: idNumber, roleId })),
            });
            msg = 'and new roles assigned';
        }
        const updatedProfile = yield prisma.profile.update({
            where: {
                id: idNumber
            },
            data: updateData,
            include: { roles: true }
        });
        res.status(200).json({
            updatedProfile,
            msg: `Profile ${updatedProfile.name} updated ${msg}`,
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
exports.updateProfileById = updateProfileById;
const deleteProfileById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        yield prisma.profile.update({
            where: {
                id: idNumber
            },
            data: {
                active: 0
            }
        });
        res.status(200).json({
            msg: `Profile ${id} deleted`,
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
exports.deleteProfileById = deleteProfileById;
//# sourceMappingURL=profile.js.map