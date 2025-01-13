import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

export const getAllRoles = async(req: Request, res: Response) => {
    try {
        const roles = await prisma.role.findMany({where: {active : 1}});
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

export const getRoleById = async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const idNumber = parseInt(id, 10);
        if (!id|| isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        
        const existingRole = await prisma.role.findFirst({where: {id: idNumber}});
        
        if(!existingRole)
            res.status(404).json({msg: 'Role not found', error: false, data:[]});
        
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

export const saveRole = async(req: Request, res: Response) => {
    try {
        const {name, description} = req.body;
        const newRole = await prisma.role.upsert({
            create: {name, description},
            update: {name, description},
            where: {name}
        });
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

export const updateRoleById = async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const idNumber = parseInt(id, 10);
        const {name, description} = req.body;
        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const updatingRole = await prisma.role.findFirst({where: {id: idNumber}});
        if(!updatingRole)
            res.status(404).json({msg: 'Role not found', error: false, data:[]});
        
        await prisma.role.update({
            where: {
                id: idNumber
            },
            data: {
                name, description
            }
        });
        res.status(200).json({
            msg: `Role ${name} updated`,
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

export const deleteRoleById = async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        await prisma.role.update({
            where: {
                id: idNumber
            },
            data: {
                active: 0
            }
        });

        res.status(200).json({
            msg: `Role ${id} deleted`,
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