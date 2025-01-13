import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const validateJWT = async(req: Request, res: Response, next: NextFunction) => {
    const token = req.header('auth-token') || '';
    if(!token){
        return res.status(401).json({
            msg: 'Non-Authenticated'
        })
    }
    try {
        jwt.verify(token, process.env.SECRETKEY || '');
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            msg: 'Invalid token'
        }) 
    }
}

