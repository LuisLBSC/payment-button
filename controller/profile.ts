import { PrismaClient } from "@prisma/client";
import e, { Request, Response } from "express"
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

export const getAllProfiles = async(req: Request, res: Response) => {
    try {
        const profiles = await prisma.profile.findMany({where: {active : 1}, include: { roles: {include: { role: { include: { roleDetails: true } } } } }});
        res.json({
            msg: 'ok',
            error: false,
            records: profiles.length,
            data: profiles
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting profiles',
            error
        });
    }
}

export const getProfileById = async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        
        const existingProfile = await prisma.profile.findFirst({where: {id: idNumber}, include: { roles: {include: { role: { include: { roleDetails: true } } } } }});
        
        if(!existingProfile)
            res.status(404).json({msg: 'Profile not found', error: false, data:[]});
    
        res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: existingProfile
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

export const saveProfile = async(req: Request, res: Response) => {
    try {
        const {name, description, roleIds} = req.body;
        const existingProfile = await prisma.profile.findUnique({
            where: { name },
            include: { roles: true }
        });

        if(existingProfile){

            const existingRoleIds = existingProfile?.roles.map(role => role.roleId);
            const newRoleIds = roleIds.filter((roleId: number) => !existingRoleIds?.includes(roleId));
        
            if (newRoleIds.length > 0) {
                const updatedProfile = await prisma.profile.update({
                    where: {name},
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
            else{
                const updatedProfile = await prisma.profile.update({
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
        else{
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
                msg: `User ${newProfile.name} created with roles`
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

export const updateProfileById = async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const idNumber = parseInt(id, 10);
        const {name, description, roleIds} = req.body;
        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        
        const updatingProfile = await prisma.profile.findFirst({where: {id: idNumber}, include: { roles: true }});
        
        if(!updatingProfile)
            res.status(404).json({msg: 'Profile not found', error: false, data:[]});
        
        const existingRoleIds = updatingProfile?.roles.map(role => role.roleId);
        const newRoleIds = roleIds.filter((roleId: number) => !existingRoleIds?.includes(roleId));
        
        if (newRoleIds.length > 0) {
            const updatedProfile = await prisma.profile.update({
                where: {
                    id: idNumber
                },
                data: {
                    description,
                    active: 1,
                    roles: {
                        create: newRoleIds.map((roleId: number) => ({ roleId }))
                    }
                }
            });

            res.status(200).json({
                updatedProfile,
                msg: `Profile ${updatedProfile.name} updated and new roles assigned`,
                error: false
            });
        }
        else{
            const updatedProfile = await prisma.profile.update({
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
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error
        });
    }
}

export const deleteProfileById = async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        await prisma.profile.update({
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
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error
        });
    }
}