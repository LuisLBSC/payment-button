import { PrismaClient } from "@prisma/client";
import e, { Request, Response } from "express"

const prisma = new PrismaClient();

export const getAllDebtsByUser = async(req: Request, res: Response) => {
    try {
        const {id} = req.body;
        const debts = await prisma.debt.findMany({where: {customerId: id}});
        res.json({
            msg: 'ok',
            error: false,
            records: debts.length,
            data: debts
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting payments',
            error
        });
    }
}

export const getDebtById = async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        const existingDebt = await prisma.debt.findFirst({where: {id: idNumber}});

        if(!existingDebt)
            res.status(404).json({msg: 'Debt not found', error: false, data:[]});
    
        res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: existingDebt
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting debt',
            error: error,
            data: []

        });
    }
}