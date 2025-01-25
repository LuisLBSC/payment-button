import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

export const getAllRoles = async (req: Request, res: Response) => {
    try {
        const roles = await prisma.role.findMany({ where: { active: 1 }, include: { roleDetails: true } });

        const transformedRoles = roles.map((role) => ({
            id: role.id,
            name: role.name,
            description: role.description,
            active: role.active,
            entities: role.roleDetails.map((detail) => detail.entity),
        }));

        res.json({
            msg: 'ok',
            error: false,
            records: transformedRoles.length,
            data: transformedRoles
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

        const existingRole = await prisma.role.findFirst({ where: { id: idNumber }, include: { roleDetails: true } });

        if (!existingRole)
            res.status(404).json({ msg: 'Role not found', error: false, data: [] });

        const transformedRole = {
            id: existingRole?.id,
            name: existingRole?.name,
            description: existingRole?.description,
            active: existingRole?.active,
            entities: existingRole?.roleDetails.map((detail) => detail.entity),
        };

        res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: transformedRole
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
        const { name, description, entities } = req.body;
        if (!Array.isArray(entities)) {
            return res.status(400).json({
                msg: "roleDetails must be an array of entity names",
            });
        }
        const newRole = await prisma.role.upsert({
            create: { name, description },
            update: { name, description },
            where: { name }
        });

        for (const entity of entities) {
            await prisma.roleDetail.upsert({
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
        const { name, description, entities } = req.body;
        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const updatingRole = await prisma.role.findFirst({ where: { id: idNumber } });
        if (!updatingRole)
            res.status(404).json({ msg: 'Role not found', error: false, data: [] });

        const updatedRole = await prisma.role.update({
            where: { id: idNumber },
            data: { name, description },
        });

        if (Array.isArray(entities)) {
            const currentRoleDetails = await prisma.roleDetail.findMany({
                where: { roleId: idNumber },
            });

            const currentEntities = currentRoleDetails.map((rd) => rd.entity);

            for (const entity of entities) {
                await prisma.roleDetail.upsert({
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

            const entitiesToDeactivate = currentEntities.filter(
                (entity) => !entities.includes(entity)
            );

            await prisma.roleDetail.updateMany({
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

        await prisma.roleDetail.updateMany({
            where: { roleId: idNumber },
            data: { active: 0 },
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