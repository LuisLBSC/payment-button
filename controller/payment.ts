import { PrismaClient } from "@prisma/client";
import e, { Request, Response } from "express"
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

export const getAllPaymentsByUser = async(req: Request, res: Response) => {
    try {
        const {id} = req.body;
        const payments = await prisma.payment.findMany({where: {customerId: id}});
        res.json({
            msg: 'ok',
            error: false,
            records: payments.length,
            data: payments
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting payments',
            error
        });
    }
}

export const getPaymentById = async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        const existingPayment = await prisma.payment.findFirst({where: {id: idNumber}});

        if(!existingPayment)
            res.status(404).json({msg: 'Payment not found', error: false, data:[]});
    
        res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: existingPayment
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting payment',
            error: error,
            data: []

        });
    }
}

export const savePayment = async(req: Request, res: Response) => {
    try {
        const ipSession = req.ip;
        const {
            customerId,
            debtId,
            cashier,
            observation,
            macAddressUser,
            receiptNumber
        } = req.body;

        const newPayment = await prisma.payment.upsert({
            create: {
                customerId,
                debtId,
                cashier,
                observation,
                macAddressUser,
                ipSession,
                receiptNumber
            },
            update: {
                customerId,
                debtId,
                cashier,
                observation,
                macAddressUser,
                ipSession,
                receiptNumber
            },
            where: {receiptNumber}
        });

        res.json({
            newPayment,
            msg: `Payment with checkout_id ${newPayment.receiptNumber} processed`
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error
        });
    }
}

export const updatePaymentById = async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const idNumber = parseInt(id, 10);
        const ipSession = req.ip;
        const {
            customerId,
            debtId,
            cashier,
            observation,
            macAddressUser,
            receiptNumber
        } = req.body;

        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        const existingPayment = await prisma.payment.findFirst({where: {id: idNumber}});

        if(!existingPayment)
            res.status(404).json({msg: 'Payment not found', error: false, data:[]});

        const updatedPayment = await prisma.payment.update({
            where : {
                id: idNumber
            },
            data : {
                customerId,
                debtId,
                cashier,
                observation,
                macAddressUser,
                ipSession,
                receiptNumber
            }
        });

        res.status(200).json({
            updatedPayment,
            msg: `Payment with checkout_id ${updatedPayment.receiptNumber} updated`,
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

export const deletePaymentById = async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
    
        await prisma.payment.update({
            where: {
                id: idNumber
            },
            data :{
                status: 0
            }
        });

        res.status(200).json({
            msg: `Payment with checkout_id ${id} deleted`,
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