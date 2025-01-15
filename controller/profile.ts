import { PrismaClient } from "@prisma/client";
import e, { Request, Response } from "express"
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

export const getAllProfiles = async(req: Request, res: Response) => {
    try {
        const profiles = await prisma.profile.findMany({where: {active : 1}, include: { roles: true }});
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
        
        const existingProfile = await prisma.profile.findFirst({where: {id: idNumber}, include: { roles: true }});
        
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
        const {name, description, roleId} = req.body;
        const existingProfile = await prisma.profile.findUnique({
            where: { name },
            include: { roles: true }
        });

        if(existingProfile){
            const existingRole = existingProfile.roles.find((role: { roleId: number }) => role.roleId === roleId);
        
            if (existingRole){
                const updatedProfile = await prisma.profile.update({
                    where: {name},
                    data: {
                        description,
                        active: 1
                    }
                });

                res.json({
                    updatedProfile,
                    msg: `Profile ${updatedProfile.name} updated with existing role`
                });
            }
            else{
                const updatedProfile = await prisma.profile.update({
                    where: { name },
                    data: {
                        description,
                        active: 1,
                        roles: {
                            create: [
                                {
                                    roleId
                                }
                            ]
                        }
                    }
                });

                res.json({
                    updatedProfile,
                    msg: `User ${updatedProfile.name} updated and new role assigned`
                });
            }
        }
        else{
            const newProfile = await prisma.profile.create({
                data: {
                    name,
                    description,
                    roles: {
                        create: [
                            {
                                roleId
                            }
                        ]
                    }
                }
            });

            res.json({
                newProfile,
                msg: `User ${newProfile.name} created`
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
        const {name, description, roleId} = req.body;
        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        
        const updatingProfile = await prisma.profile.findFirst({where: {id: idNumber}, include: { roles: true }});
        
        if(!updatingProfile)
            res.status(404).json({msg: 'Profile not found', error: false, data:[]});
        
        const existingRole = updatingProfile?.roles.find((role: { roleId: number }) => role.roleId === roleId);
        
        if (existingRole){
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
                msg: `Profile ${updatedProfile.name} updated with existing role`,
                error: false,
                records: 1
            });
        }
        else{
            const updatedProfile = await prisma.profile.update({
                where: {
                    id: idNumber
                },
                data: {
                    description,
                    active: 1,
                    roles: {
                        create: [
                            {
                                roleId
                            }
                        ]
                    }
                }
            });

            res.status(200).json({
                updatedProfile,
                msg: `User ${updatedProfile.name} updated and new role assigned`
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