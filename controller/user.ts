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
            msg: 'Error obteniendo usuarios',
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
            res.status(404).json({msg: 'Usuario no encontrado', error: false, data:[]});
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
            msg: 'Error obteniendo usuario',
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
            res.status(404).json({msg: 'Usuario no encontrado', error: false, data:[]});
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
            msg: 'Error obteniendo usuario',
            error: error,
            data: []

        });
    }
}

export const saveUser = async(req: Request, res: Response) => {
    try {
        const {
            username, 
            password, 
            email, 
            name, 
            middlename,
            lastname,
            phone,
            address,
            country,
            postCode, 
            profileId
        } = req.body; 
        const encryptedPassword = await encryptPassword(password);
        const newUser = await prisma.user.upsert({
            create: {
                username, 
                password: encryptedPassword, 
                email, 
                name, 
                middlename,
                lastname, 
                phone, 
                address, 
                country, 
                postCode, 
                profileId, 
                active: 1
            },
            update: {
                username, 
                password: encryptedPassword, 
                email, 
                name, 
                middlename,
                lastname, 
                phone, 
                address, 
                country, 
                postCode, 
                active: 1},
            where: {username}
        });
        res.json({
            newUser,
            msg: `Usuario ${newUser.username} creado`
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
        const {
            username, 
            password, 
            email, 
            name, 
            middlename,
            lastname,
            phone,
            address,
            country,
            postCode, 
            profileId
        } = req.body;
        
        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        
        const existingUser = await prisma.user.findFirst({where: {id: idNumber}});
        
        if(!existingUser)
            res.status(404).json({msg: 'Usuario no encontrado', error: false, data:[]});

        const updateData: any = {};
        if (username) updateData.username = username;
        if (password) updateData.password = await encryptPassword(password);
        if (email) updateData.email = email;
        if (name) updateData.name = name;
        if (middlename) updateData.middlename = middlename;
        if (lastname) updateData.lastname = lastname;
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;
        if (country) updateData.country = country;
        if (postCode) updateData.postCode = postCode;
        if (profileId) updateData.profileId = profileId;

        if (!password) {
            delete updateData.password;
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: idNumber
            },
            data: updateData
        });

        res.status(200).json({
            updatedUser,
            msg: `Usuario ${updatedUser.username} actualizado`,
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
            msg: `Usuario ${id} eliminado`,
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