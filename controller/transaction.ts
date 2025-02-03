import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();
export const getAllTransactions = async(req: Request, res: Response) => {
    try {
        const {
            trxId,
            lot,
            state
        } = req.query;
        const dateStart = req.query.dateStart as string;
        const dateEnd = req.query.dateEnd as string;
        const filters: any = {};
        
        if (trxId) filters.trxId = { contains: trxId, mode: 'insensitive' };
        if (lot) filters.lot = { contains: lot, mode: 'insensitive' };
        if (state) filters.state = { contains: state, mode: 'insensitive' };
        if(dateStart || dateEnd){
            filters.executionDate = {};
            if(dateStart) filters.executionDate.gte = new Date(dateStart);
            if(dateEnd) filters.executionDate.lte = new Date(dateEnd);
        }
        
        const transaction = await prisma.transaction.findMany({include: {acquirer: true }, where: filters});
        res.json({
            msg: 'ok',
            error: false,
            records: transaction.length,
            data: transaction
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting transactions',
            error
        });
    }
}