import { PrismaClient } from "@prisma/client";
import e, { Request, Response } from "express"
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

export const getAllPaymentsByUser = async(req: Request, res: Response) => {
    try {
        const {id} = req.body;
        const payments = await prisma.payment.findMany({where: {customerId: id}, include: { debt: true }});
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

        const existingPayment = await prisma.payment.findFirst({where: {id: idNumber}, include: { debt: true }});

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

export const deletePaymentById = async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
    
        await prisma.payment.delete({ where: {id: idNumber}});

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