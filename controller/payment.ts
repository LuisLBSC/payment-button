import { PrismaClient } from "@prisma/client";
import e, { Request, Response } from "express"
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

export const getAllPaymentsByUser = async(req: Request, res: Response) => {
    try {
        const {id} = req.body;
        const {
            lot,
            state,
            type
        } = req.query;
        const dateStart = req.query.dateStart as string;
        const dateEnd = req.query.dateEnd as string;
        const filters: any = {};
        
        if (id) filters.customerId = parseInt(id as string, 10);

        if(dateStart || dateEnd){
            filters.createdAt = {};
            if(dateStart) filters.createdAt.gte = new Date(dateStart);
            if(dateEnd) filters.createdAt.lte = new Date(dateEnd);
        }
        if (lot || state || type) {
            filters.transaction = {};
            if (lot) filters.transaction.lot = { contains: lot, mode: 'insensitive' };
            if (state) filters.transaction.state = { contains: state, mode: 'insensitive' };
            if (type) filters.transaction.type = { contains: type, mode: 'insensitive' };
        }

        const payments = await prisma.payment.findMany({where: filters, include: { debt: true, transaction: true  }});
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

        const existingPayment = await prisma.payment.findFirst({where: {id: idNumber}, include: { debt: true, transaction: true }});

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