import { PrismaClient } from "@prisma/client";
import e, { Request, Response } from "express"
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

export const getAllPaymentsByUser = async(req: Request, res: Response) => {
    try {
        const {
            userId,
            lot,
            state,
            type
        } = req.query;
        const dateStart = req.query.dateStart as string;
        const dateEnd = req.query.dateEnd as string;
        const filters: any = {};
        
        if (!userId) {
            return res.status(400).json({ msg: "Usuario ID is requerido", error: true });
        }

        const user = await prisma.user.findUnique({
            where: {id: parseInt(userId as string, 10)},
            include: {profile: true}
        });

        if(!user){
            return res.status(404).json({msg: "Usuario no encontrado", error: true});
        }

        const isCustomer = user.profile.name === "CUSTOMER";

        if(isCustomer){
            filters.customerId = user.id;
        }

        if(!dateStart || !dateEnd){
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            filters.createdAt = {
                gte: threeDaysAgo,
                lte: new Date()
            };
        }else {
            filters.createdAt = {};
            if (dateStart) filters.createdAt.gte = new Date(dateStart as string);
            if (dateEnd) filters.createdAt.lte = new Date(dateEnd as string);
        }

        if (lot || state || type) {
            filters.transaction = {};
            if (lot) filters.transaction.lot = { contains: lot, mode: 'insensitive' };
            if (state) filters.transaction.state = { contains: state, mode: 'insensitive' };
            if (type) filters.transaction.type = { contains: type, mode: 'insensitive' };
        }

        const payments = await prisma.payment.findMany({
            where: filters, 
            include: { debt: true, transaction: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            msg: 'ok',
            error: false,
            records: payments.length,
            data: payments
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error obteniendo pagos',
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
            res.status(404).json({msg: 'Pago no encontrado', error: false, data:[]});
    
        res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: existingPayment
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error obteniendo pago',
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
            msg: `Pago con checkout_id ${id} eliminado`,
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