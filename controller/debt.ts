import { PrismaClient } from "@prisma/client";
import e, { Request, Response } from "express"

const prisma = new PrismaClient();

export const getAllDebtsByUser = async(req: Request, res: Response) => {
    try {
        const {id} = req.body;
        const {
            liquidationId,
            titleName,
            liquidationCode,
            identification,
            courtCosts,
            localCode,
            plotId,
            actionLiquidationType,
            liquidationState,
            year
        } = req.body;

        if (!id) {
            return res.status(400).json({
                msg: 'customerId is required',
                error: true
            });
        }

        const filters: any = { customerId: id };
        if (liquidationId) filters.liquidationId = parseInt(liquidationId as string, 10);
        if (titleName) filters.titleName = { contains: titleName, mode: 'insensitive' };
        if (liquidationCode) filters.liquidationCode = { contains: liquidationCode, mode: 'insensitive' };
        if (identification) filters.identification = parseInt(identification as string, 10);
        if (courtCosts) filters.courtCosts = parseInt(courtCosts as string, 10);
        if (localCode) filters.localCode = { contains: localCode, mode: 'insensitive' };
        if (plotId) filters.plotId = parseInt(plotId as string, 10);
        if (actionLiquidationType) filters.actionLiquidationType = parseInt(actionLiquidationType as string, 10);
        if (liquidationState) filters.liquidationState = parseInt(liquidationState as string, 10);
        if (year) filters.year = parseInt(year as string, 10);

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
            customerId,
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
                customerId,
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