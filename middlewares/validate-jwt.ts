import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const validateJWT = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('auth-token') || '';
    if (!token) {
        return res.status(401).json({
            msg: 'No Autenticado'
        })
    }
    try {
        jwt.verify(token, process.env.SECRETKEY || '');
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            msg: 'Token inválido'
        })
    }
}

export const validateAuthStatus = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('auth-token') || '';
    if (!token) {
        return res.status(401).json({
            msg: 'No Autenticado'
        })
    }
    try {
        const validateToken = jwt.verify(token, process.env.SECRETKEY || '');

        if (!validateToken) return res.status(400).json({ msg: 'Token inválido', error: true, records: 0, data: [] });

        const registeredUser = await prisma.user.findUnique({ where: { id: validateToken.id } });
        const { password, ...userWithoutPassword } = registeredUser
        
        return res.status(200).json({
            msg: 'Autenticado',
            user: userWithoutPassword
        })
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            msg: 'Token inválido'
        })
    }
}
