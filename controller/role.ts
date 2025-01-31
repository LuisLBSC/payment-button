import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

export const getAllRoles = async (req: Request, res: Response) => {
    try {
        const roles = await prisma.role.findMany({ include: { entities: { include: { entity: true } } } });

        res.json({
            msg: 'ok',
            error: false,
            records: roles.length,
            data: roles
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting roles',
            error
        });
    }
}

export const getRoleById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        const existingRole = await prisma.role.findFirst({ where: { id: idNumber }, include: { entities: { include: { entity: true } } } });

        if (!existingRole)
            res.status(404).json({ msg: 'Role not found', error: false, data: [] });

        res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: existingRole
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting role',
            error: error,
            data: []

        });
    }
}

export const saveRole = async (req: Request, res: Response) => {
    try {
        const { name, description, active, entityIds } = req.body;

        const existingRole = await prisma.role.findUnique({
            where: { name },
            include: { entities: true }
        });
        
        if(existingRole){

            const existingEntityIds = existingRole?.entities.map(entity => entity.entityId);
            const newEntityIds = entityIds.filter((entityId: number) => !existingEntityIds?.includes(entityId));
        
            if (newEntityIds.length > 0) {
                const updatedRole = await prisma.role.update({
                    where: {name},
                    data: {
                        description,
                        active: 1,
                        entities: {
                            create: newEntityIds.map((entityId: number) => ({ entityId }))
                        }
                    }
                });

                res.json({
                    updatedRole,
                    msg: `Role ${updatedRole.name} updated and new entities assigned`
                });
            }
            else{
                const updatedRole = await prisma.role.update({
                    where: { name },
                    data: {
                        description,
                        active: 1
                    }
                });

                res.json({
                    updatedRole,
                    msg: `Role ${updatedRole.name} updated with existing entities`
                });
            }
        }
        else{
            const newRole = await prisma.role.create({
                data: {
                    name,
                    description,
                    entities: {
                        create: entityIds.map((entityId: number) => ({ entityId }))
                    }
                }
            });

            res.json({
                newRole,
                msg: `Role ${newRole.name} created with roles`
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

export const updateRoleById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        const { name, description, active, entityIds } = req.body;
        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const updatingRole = await prisma.role.findFirst({ where: { id: idNumber }, include: { entities: true } });
        if (!updatingRole)
            res.status(404).json({ msg: 'Role not found', error: false, data: [] });

        const existingEntityIds = updatingRole?.entities.map(entity => entity.entityId);
        const newEntityIds = entityIds.filter((entityId : number) => !existingEntityIds?.includes(entityId) );

        if (newEntityIds.length > 0) {
            const updatingRole = await prisma.role.update({
                where: {
                    id: idNumber
                },
                data: {
                    description,
                    active: 1,
                    entities: {
                        create: newEntityIds.map((entityId: number) => ({ entityId }))
                    }
                }
            });

            res.status(200).json({
                updatingRole,
                msg: `Role ${updatingRole.name} updated and new entities assigned`,
                error: false
            });
        }
        else{
            const updatingRole = await prisma.role.update({
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
                msg: `Role ${updatingRole.name} updated with existing entities`
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

export const deleteRoleById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        const roleExists = await prisma.role.findUnique({
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

        await prisma.role.update({
            where: {
                id: idNumber
            },
            data: {
                active: 0
            }
        });

        await prisma.roleEntity.deleteMany({
            where: { roleId: idNumber }
        });

        res.status(200).json({
            msg: `Role ${id} deleted and its details were deleted too`,
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