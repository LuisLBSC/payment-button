import { PrismaClient } from "@prisma/client";
import e, { Request, Response } from "express"

const prisma = new PrismaClient();

export const getAllDebtsByUser = async(req: Request, res: Response) => {
    try {
        const {
            liquidationCode,
            localCode,
            actionLiquidationType,
            ext
        } = req.query;

        const filters: any = {};
        let localCodeExt = localCode;
        if (ext && ext.length > 0) localCodeExt = localCodeExt?.concat(` LC:${ext}`);
        if (liquidationCode) filters.liquidationCode = { contains: liquidationCode, mode: 'insensitive' };
        if (localCode) filters.localCode = { contains: localCodeExt, mode: 'insensitive' };
        if (actionLiquidationType) filters.actionLiquidationType = parseInt(actionLiquidationType as string, 10);

        const debts = await prisma.debt.findMany({where: filters});

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

export const saveDebt = async(req: Request, res: Response) => {
    try {
        const {
            liquidationId,
            titleName,
            liquidationCode,
            debtDate,
            shopperName,
            identification,
            courtCosts,
            localCode,
            plotId,
            actionLiquidationType,
            liquidationState,
            year,
            surcharge,
            discount,
            interest,
            coercive,
            totalAmount
        } = req.body

        const newDebt = await prisma.debt.create({
            data: {
                liquidationId,
                titleName,
                liquidationCode,
                debtDate,
                shopperName,
                identification,
                courtCosts,
                localCode,
                plotId,
                actionLiquidationType,
                liquidationState,
                year,
                surcharge,
                discount,
                interest,
                coercive,
                totalAmount
            }
        });

        res.json({
            newDebt,
            msg: `Debt ${newDebt.titleName} created`
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Something went wrong',
            error
        });
    }
}

export const deleteDebtById = async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
    
        await prisma.debt.delete({where: {id: idNumber}});

        res.status(200).json({
            msg: `Debt ${id} deleted`,
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