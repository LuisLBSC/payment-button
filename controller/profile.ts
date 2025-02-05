import { PrismaClient } from "@prisma/client";
import e, { Request, Response } from "express"
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

export const getAllProfiles = async (req: Request, res: Response) => {
    try {
        const profiles = await prisma.profile.findMany({
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
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting profiles',
            error
        });
    }
}

export const getProfileById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        const existingProfile = await prisma.profile.findFirst({
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
        existingProfile?.roles.forEach((profileRole) => {
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
            id: existingProfile?.id,
            name: existingProfile?.name,
            description: existingProfile?.description,
            active: existingProfile?.active,
            entities: Array.from(entityMap.values())
        };

        res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: profileWithEntities
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting profile',
            error: error,
            data: []

        });
    }
}

export const saveProfile = async (req: Request, res: Response) => {
    try {
        const { name, description, roleIds } = req.body;
        const existingProfile = await prisma.profile.findUnique({
            where: { name },
            include: { roles: true }
        });

        if (existingProfile) {

            const existingRoleIds = existingProfile?.roles.map(role => role.roleId);
            const newRoleIds = roleIds.filter((roleId: number) => !existingRoleIds?.includes(roleId));

            if (newRoleIds.length > 0) {
                const updatedProfile = await prisma.profile.update({
                    where: { name },
                    data: {
                        description,
                        active: 1,
                        roles: {
                            create: newRoleIds.map((roleId: number) => ({ roleId }))
                        }
                    }
                });

                res.json({
                    updatedProfile,
                    msg: `Profile ${updatedProfile.name} updated and new roles assigned`
                });
            }
            else {
                const updatedProfile = await prisma.profile.update({
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
            const newProfile = await prisma.profile.create({
                data: {
                    name,
                    description,
                    roles: {
                        create: roleIds.map((roleId: number) => ({ roleId }))
                    }
                }
            });

            res.json({
                newProfile,
                msg: `Profile ${newProfile.name} created with roles`
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Something went wrong',
            error
        });
    }
}

export const updateProfileById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        const { name, description, roleIds } = req.body;
        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        const updatingProfile = await prisma.profile.findFirst({ where: { id: idNumber }, include: { roles: true } });

        if (!updatingProfile)
            res.status(404).json({ msg: 'Profile not found', error: false, data: [] });

        const existingRoleIds = updatingProfile?.roles.map(role => role.roleId);
        const newRoleIds = roleIds || [];

        const rolesToRemove = existingRoleIds?.filter(roleId => !newRoleIds.includes(roleId));
        const rolesToAdd = newRoleIds.filter((roleId: number) => !existingRoleIds?.includes(roleId));

        const updateData: any = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        updateData.active = 1;

        let msg = 'with existing roles';

        if (rolesToRemove && rolesToRemove.length > 0) {
            await prisma.profileRole.deleteMany({
                where: {
                    profileId: idNumber,
                    roleId: { in: rolesToRemove },
                },
            });
        }

        if (rolesToAdd.length > 0) {
            await prisma.profileRole.createMany({
                data: rolesToAdd.map((roleId: number) => ({ profileId: idNumber, roleId })),
            });
            msg = 'and new roles assigned';
        }

        const updatedProfile = await prisma.profile.update({
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
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error
        });
    }
}

export const deleteProfileById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        await prisma.profileRole.deleteMany({
            where: {
                profileId: idNumber
            }
        });
        
        await prisma.profile.delete({
            where: {
                id: idNumber
            }
        });

        res.status(200).json({
            msg: `Profile ${id} deleted`,
            error: false
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error
        });
    }
}