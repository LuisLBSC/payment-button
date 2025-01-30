import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();
export const getAllTransactions = async(req: Request, res: Response) => {
    try {
        const params = await prisma.transaction.findMany({include: {acquirer: true }});
        res.json({
            msg: 'ok',
            error: false,
            records: params.length,
            data: params
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting transactions',
            error
        });
    }
}