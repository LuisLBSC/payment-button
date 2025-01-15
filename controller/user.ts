import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { encryptPassword, validatePassword} from "../helpers/password";

const prisma = new PrismaClient();
export const getAllUsers = async(req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({where: {active : 1}});
        res.json({
            msg: 'ok',
            error: false,
            records: users.length,
            data: users
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting users',
            error
        });
    }
}

export const getUserById = async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        
        const existingUser = await prisma.user.findFirst({where: {id: idNumber}});
        
        if(!existingUser)
            res.status(404).json({msg: 'User not found', error: false, data:[]});
        else{
            res.json({
                msg: 'ok',
                error: false,
                records: 1,
                data: existingUser
            });
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting user',
            error: error,
            data: []

        });
    }
}

export const getUserByUsername = async(req: Request, res: Response) => {
    try {
        const {username} = req.body;
        if (!username) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        
        const existingUser = await prisma.user.findFirst({where: {username}});
        
        if(!existingUser){
            res.status(404).json({msg: 'User not found', error: false, data:[]});
        }
        else{
            res.json({
                msg: 'ok',
                error: false,
                records: 1,
                data: existingUser
            });
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting user',
            error: error,
            data: []

        });
    }
}

export const saveUser = async(req: Request, res: Response) => {
    try {
        const {username, password, email, roleId} = req.body; 
        const encryptedPassword = await encryptPassword(password);
        const newUser = await prisma.user.upsert({
            create: {username, password: encryptedPassword, email, profileId, active: 1},
            update: {username, password: encryptedPassword, email, profileId, active: 1},
            where: {username}
        });
        res.json({
            newUser,
            msg: `User ${newUser.username} created`
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error
        });
    }
}

export const updateUserById = async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const idNumber = parseInt(id, 10);
        const {username, password, email, roleId} = req.body;
        const encryptedPassword = await encryptPassword(password);;
        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        
        const existingUser = await prisma.user.findFirst({
            where: {id: idNumber},
            include: { roles: true }
        });
        
        if(!existingUser)
            res.status(404).json({msg: 'User not found', error: false, data:[]});

        const updatedUser = await prisma.user.update({
            where: {
                id: idNumber
            },
            data: {
                username, 
                password: encryptedPassword, 
                email, 
                profileId,
            }
        });

        res.status(200).json({
            updatedUser,
            msg: `User ${username} updated`,
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

export const deleteUserById = async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        await prisma.user.update({
            where: {
                id: idNumber
            },
            data: {
                active: 0
            }
        });
        
        res.status(200).json({
            msg: `User ${id} deleted`,
            error: false
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error
        });
    }
}