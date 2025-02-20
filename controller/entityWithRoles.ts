import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

export const getEntitiesWithRoles = async (req: Request, res: Response) => {
    try {
        const entities = await prisma.entity.findMany({
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
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Something went wrong',
            error
        });
    }
};


export const saveEntitiesWithRoles = async (req: Request, res: Response) => {
    try {
        const entities = req.body;
        const entitiesWithRoles = [];

        for (const entityData of entities) {
            const { name, description, roles } = entityData;

            const entity = await prisma.entity.upsert({
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

                const role = await prisma.role.create({
                    data: {
                        name: roleName,
                        description: roleDescription,
                        active: 1,
                    }
                });

                await prisma.roleEntity.upsert({
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
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Something went wrong',
            error,
        });
    }
};
