import { PrismaClient } from "@prisma/client";
import e, { Request, Response } from "express"
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

export const getAllPaymentDetails = async(req: Request, res: Response, paymentId: number) => {
    try {
        const {paymentId} = req.body;
        const paymentDetails = await prisma.paymentDetail.findMany({where: {paymentId}});
        res.json({
            msg: 'ok',
            error: false,
            records: paymentDetails.length,
            data: paymentDetails
        }) 
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting payment detail',
            error: error,
            data: []

        });
    }
}


export const getPaymentDetailById = async(req: Request, res: Response) => {
    try {
        const {id} = req.params
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        const existingPaymentDetail = await prisma.paymentDetail.findFirst({where: {id: idNumber}});

        if(!existingPaymentDetail)
            res.status(404).json({msg: 'Payment not found', error: false, data:[]});
    
        res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: existingPaymentDetail
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting payment detail',
            error: error,
            data: []

        });
    }
}