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
        const {
            customerId,
            checkout_id,
            result_description,
            transaction_id,
            payment_type,
            payment_brand,
            amount,
            merchant_transactionId,
            result_code,
            extended_description,
            acquirer_response,
            batch_no,
            interest,
            total_amount,
            reference_no,
            bin,
            last_4_Digits,
            email,
            shopper_mid,
            shopper_tid,
            request_json,
            response_json,
            status
        } = req.body;

        const newPayment = await prisma.payment.upsert({
            create: {
                customerId,
                checkout_id,
                result_description,
                transaction_id,
                payment_type,
                payment_brand,
                amount,
                merchant_transactionId,
                result_code,
                extended_description,
                acquirer_response,
                batch_no,
                interest,
                total_amount,
                reference_no,
                bin,
                last_4_Digits,
                email,
                shopper_mid,
                shopper_tid,
                request_json,
                response_json,
                status
            },
            update: {
                customerId,
                checkout_id,
                result_description,
                transaction_id,
                payment_type,
                payment_brand,
                amount,
                merchant_transactionId,
                result_code,
                extended_description,
                acquirer_response,
                batch_no,
                interest,
                total_amount,
                reference_no,
                bin,
                last_4_Digits,
                email,
                shopper_mid,
                shopper_tid,
                request_json,
                response_json,
                status
            },
            where: {checkout_id}
        });

        res.json({
            newPayment,
            msg: `Payment with checkout_id ${newPayment.checkout_id} processed`
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
        const {
            customerId,
            checkout_id,
            result_description,
            transaction_id,
            payment_type,
            payment_brand,
            amount,
            merchant_transactionId,
            result_code,
            extended_description,
            acquirer_response,
            batch_no,
            interest,
            total_amount,
            reference_no,
            bin,
            last_4_Digits,
            email,
            shopper_mid,
            shopper_tid,
            request_json,
            response_json,
            status
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
                checkout_id,
                result_description,
                transaction_id,
                payment_type,
                payment_brand,
                amount,
                merchant_transactionId,
                result_code,
                extended_description,
                acquirer_response,
                batch_no,
                interest,
                total_amount,
                reference_no,
                bin,
                last_4_Digits,
                email,
                shopper_mid,
                shopper_tid,
                request_json,
                response_json,
                status
            }
        });

        res.status(200).json({
            updatedPayment,
            msg: `Payment with checkout_id ${updatedPayment.checkout_id} updated`,
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