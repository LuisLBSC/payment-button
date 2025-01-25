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
        const profiles = yield prisma.profile.findMany({ where: { active: 1 }, include: { roles: { include: { role: { include: { roleDetails: true } } } } } });
        const transformedProfiles = profiles.map((profile) => ({
            id: profile.id,
            name: profile.name,
            description: profile.description,
            active: profile.active,
            roles: profile.roles.map((roleRelation) => ({
                id: roleRelation.role.id,
                name: roleRelation.role.name,
                description: roleRelation.role.description,
                active: roleRelation.role.active,
                entities: roleRelation.role.roleDetails.map((detail) => detail.entity),
            })),
        }));
        res.json({
            msg: 'ok',
            error: false,
            records: transformedProfiles.length,
            data: transformedProfiles
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
        const existingProfile = yield prisma.profile.findFirst({ where: { id: idNumber }, include: { roles: { include: { role: { include: { roleDetails: true } } } } } });
        if (!existingProfile)
            res.status(404).json({ msg: 'Profile not found', error: false, data: [] });
        const transformedProfile = {
            id: existingProfile === null || existingProfile === void 0 ? void 0 : existingProfile.id,
            name: existingProfile === null || existingProfile === void 0 ? void 0 : existingProfile.name,
            description: existingProfile === null || existingProfile === void 0 ? void 0 : existingProfile.description,
            active: existingProfile === null || existingProfile === void 0 ? void 0 : existingProfile.active,
            roles: existingProfile === null || existingProfile === void 0 ? void 0 : existingProfile.roles.map((roleRelation) => ({
                id: roleRelation.role.id,
                name: roleRelation.role.name,
                description: roleRelation.role.description,
                active: roleRelation.role.active,
                entities: roleRelation.role.roleDetails.map((detail) => detail.entity),
            })),
        };
        res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: transformedProfile
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
                    msg: `User ${updatedProfile.name} updated with existing roles`
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
                msg: `User ${newProfile.name} created with roles`
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
        const newRoleIds = roleIds.filter((roleId) => !(existingRoleIds === null || existingRoleIds === void 0 ? void 0 : existingRoleIds.includes(roleId)));
        if (newRoleIds.length > 0) {
            const updatedProfile = yield prisma.profile.update({
                where: {
                    id: idNumber
                },
                data: {
                    description,
                    active: 1,
                    roles: {
                        create: newRoleIds.map((roleId) => ({ roleId }))
                    }
                }
            });
            res.status(200).json({
                updatedProfile,
                msg: `Profile ${updatedProfile.name} updated and new roles assigned`,
                error: false
            });
        }
        else {
            const updatedProfile = yield prisma.profile.update({
                where: {
                    id: idNumber
                },
                data: {
                    description,
                    active: 1
                }
            });
            res.status(200).json({
                updatedProfile,
                msg: `Profile ${updatedProfile.name} updated with existing roles`
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