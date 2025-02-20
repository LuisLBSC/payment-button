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

        const filters: any = {};
        const dateStart = req.query.dateStart as string;
        const dateEnd = req.query.dateEnd as string;
        
        if (trxId) filters.trxId = { contains: trxId, mode: 'insensitive' };
        if (lot) filters.lot = { contains: lot, mode: 'insensitive' };
        if (state) filters.state = { contains: state, mode: 'insensitive' };

        if(!dateStart || !dateEnd){
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            filters.executionDate = {
                gte: threeDaysAgo,
                lte: new Date()
            };
        }else {
            filters.executionDate = {};
            if (dateStart) filters.executionDate.gte = new Date(dateStart as string);
            if (dateEnd) filters.executionDate.lte = new Date(dateEnd as string);
        }
        const transaction = await prisma.transaction.findMany({
            include: {acquirer: true }, 
            where: filters,
            orderBy: { executionDate: 'desc' }
        });
        res.json({
            msg: 'ok',
            error: false,
            records: transaction.length,
            data: transaction
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error obteniendo transacciones',
            error
        });
    }
}