import { PrismaClient } from "@prisma/client";
import e, { Request, Response } from "express";
import axios from 'axios';
import querystring from 'querystring';
import { sendEmail } from "./mail";

const prisma = new PrismaClient();

export const requestCheckout = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {
            customerId,
            debtIds,
        } = req.body;
        const customer = await prisma.user.findFirst({ where: { id: customerId, active: 1 } });
        if (!customer) {
            return res.status(404).json({
                msg: 'Cliente no encontrado o inactivo',
                error: true,
            });
        }
        const debts = await prisma.debt.findMany({
            where: { id: { in: debtIds } }
        }) as Array<{
            id: number;
            titleName: string | null;
            liquidationCode: string;
            debtDate: Date;
            shopperName: string;
            identification: number | null;
            courtCosts: number | null;
            localCode: string;
            plotId: number;
            actionLiquidationType: number;
            liquidationState: number;
            year: number;
            surcharge: number | null;
            discount: number | null;
            interest: number | null;
            coercive: number | null;
            totalAmount: number;
            createdAt: Date;
            liquidationId: number;
        }>;
        if (!debts || debts.length === 0) {
            return res.status(404).json({
                msg: 'Deudas no encontradas',
                error: true,
            });
        }

        const requestParams = await prisma.param.findMany({
            where: {
                key: {
                    startsWith: 'request_',
                },
            },
        });

        const paramsMap: { [key: string]: string | undefined } = requestParams.reduce((acc, param) => {
            const key = param.key.replace('request_', '');
            acc[key] = param.value;
            return acc;
        }, {} as { [key: string]: string | undefined });

        const { entityId, token, mid, tid, currency, mid_risk, percent_tax, base0 } = paramsMap;
        const missingParams: string[] = [];
        if (!entityId) missingParams.push('entityId');
        if (!token) missingParams.push('token');
        if (!mid) missingParams.push('mid');
        if (!tid) missingParams.push('tid');
        if (!currency) missingParams.push('currency');
        if (!mid_risk) missingParams.push('mid_risk');
        if (!percent_tax) missingParams.push('percent_tax');
        if (!base0) missingParams.push('base0');

        if (missingParams.length > 0) {
            return res.status(400).json({
                msg: `Faltan parámetros requeridos: ${missingParams.join(', ')}`,
                error: true,
            });
        }

        const percentTax = typeof percent_tax === 'string' ? parseFloat(percent_tax) : percent_tax ?? 0;
        const base_0 = typeof base0 === 'string' ? parseFloat(base0) : base0 ?? 0;
        const transaction = `transaction#${Date.now()}`;

        let itemIndex = 0;
        let total = 0;
        let cartItems: { [key: string]: string } = {};
        let valueNoTax = 0;
        let valueTax = 0;
        debts.forEach(debt => {
            const tax = debt.totalAmount * percentTax;
            const debtNoTax = debt.totalAmount - tax;
            valueTax += tax;
            valueNoTax += debtNoTax;
            total += debt.totalAmount;
            cartItems[`cart.items[${itemIndex}].name`] = debt.titleName || 'No title';
            cartItems[`cart.items[${itemIndex}].description`] = `${debt.localCode || 'No description'}`;
            cartItems[`cart.items[${itemIndex}].price`] = debt.totalAmount.toString();
            cartItems[`cart.items[${itemIndex}].quantity`] = '1';
            itemIndex++;
        });

        const queryObject = {
            entityId,
            amount: total.toFixed(2),
            currency,
            paymentType: 'DB',
            'customer.givenName': customer.name,
            'customer.middleName': customer.middlename,
            'customer.surname': customer.lastname,
            'customer.ip': req.ip,
            'customer.merchantCustomerId': customer.id.toString(),
            'merchantTransactionId': transaction,
            'customer.email': customer.email,
            'customer.identificationDocType': 'IDCARD',
            'customer.identificationDocId': customer.username,
            'customer.phone': customer.phone,
            'billing.street1': customer.address,
            'billing.country': customer.country,
            'billing.postcode': customer.postCode,
            'shipping.street1': customer.address,
            'shipping.country': customer.country,
            'risk.parameters[SHOPPER_MID]': mid_risk,
            'customParameters[SHOPPER_MID]': mid,
            'customParameters[SHOPPER_TID]': tid,
            'customParameters[SHOPPER_ECI]': '0103910',
            'customParameters[SHOPPER_PSERV]': '17913101',
            'customParameters[SHOPPER_VAL_BASE0]': 1,
            'customParameters[SHOPPER_VAL_BASEIMP]': (valueNoTax - 1).toFixed(2),
            'customParameters[SHOPPER_VAL_IVA]': valueTax.toFixed(2),
            'customParameters[SHOPPER_VERSIONDF]': '2',
            'testMode': 'EXTERNAL',
            ...cartItems
        };

        const query = querystring.stringify(queryObject);

        const url = `${process.env.DATAFAST_URL}${process.env.DATAFAST_URL_PATH}?${query}`;

        const { data } = await axios.post(url, {},
            {
                headers: {
                    Authorization: `Bearer ${paramsMap.token}`,
                },
                httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
            }
        );

        if (data.id) {

            return res.status(200).json({
                msg: 'ok',
                error: false,
                data: {
                    id: data.id
                },
            });
        }
        else {
            return res.status(404).json({
                msg: 'Error al obtener checkoutId',
                error: true,
                data,
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            msg: 'Something went wrong',
            error
        });
    }
};

export const savePaymentWithCheckoutId = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { checkoutId } = req.body;

        if (!checkoutId) {
            return res.status(400).json({
                msg: 'checkoutId es requerido',
                error: true,
            });
        }

        const requestParams = await prisma.param.findMany({
            where: {
                key: {
                    startsWith: 'request_',
                },
            },
        });

        const paramsMap: { [key: string]: string | undefined } = requestParams.reduce((acc, param) => {
            const key = param.key.replace('request_', '');
            acc[key] = param.value;
            return acc;
        }, {} as { [key: string]: string | undefined });

        const { entityId, token } = paramsMap;
        const missingParams: string[] = [];
        if (!entityId) missingParams.push('entityId');
        if (!token) missingParams.push('token');

        if (missingParams.length > 0) {
            return res.status(400).json({
                msg: `Faltan parámetros requeridos: ${missingParams.join(', ')}`,
                error: true,
            });
        }

        const params = { entityId };

        const url = `${process.env.DATAFAST_URL}${process.env.DATAFAST_URL_PATH}/${checkoutId}/payment?entityId=${entityId}`;

        const { data } = await axios.get(url,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
            }
        );

        let transactionState = 'RECHAZADO';
        const { card, result, resultDetails, cart, customer, customParameters } = data;
        if (!resultDetails.ExtendedDescription.includes("Transaccion rechazada")) {
            transactionState = 'PROCESADO';

            const newTransaction = await prisma.transaction.upsert({
                create: {
                    type: data.paymentType,
                    state: transactionState,
                    trxId: data.id,
                    bankResponse: resultDetails.Response || '',
                    responseText: resultDetails.ExtendedDescription,
                    lot: resultDetails.BatchNo,
                    reference: resultDetails.ReferenceNo,
                    acquirerId: parseInt(customer.merchantCustomerId),
                    authorization: parseInt(resultDetails.AuthCode) || 0,
                    buttonResponse: result.code,
                    amount: parseFloat(data.amount),
                    interest: parseFloat(customParameters.SHOPPER_VAL_IVA),
                    totalAmount: parseFloat(data.amount),
                    jsonResponse: JSON.stringify(data)
                },
                update: {
                    type: data.paymentType,
                    state: transactionState,
                    trxId: data.id,
                    bankResponse: resultDetails.Response || '',
                    responseText: resultDetails.ExtendedDescription,
                    lot: resultDetails.BatchNo,
                    reference: resultDetails.ReferenceNo,
                    acquirerId: parseInt(customer.merchantCustomerId),
                    authorization: parseInt(resultDetails.AuthCode) || 0,
                    buttonResponse: result.code,
                    amount: parseFloat(data.amount),
                    interest: parseFloat(customParameters.SHOPPER_VAL_IVA),
                    totalAmount: parseFloat(data.amount),
                    jsonResponse: JSON.stringify(data)
                },
                where: { trxId: data.id }
            });

            const paymentPromises = cart.items.map(async (item: any) => {
                const payment = await prisma.payment.create({
                    data: {
                        customerId: parseInt(customer.merchantCustomerId),
                        cashier: 30,
                        debtId: 3,
                        ipSession: customer.ip,
                        cardNumber: `${card.bin}XXXXXX${card.last4Digits}`,
                        cardExpirationDate: `${card.expiryMonth}/${card.expiryYear}`,
                        cardHolderName: card.holder,
                        message: resultDetails.ExtendedDescription,
                        receiptNumber: resultDetails.ReferenceNbr,
                        bank_id: 1,
                        cardAuthorization: resultDetails.AuthCode,
                        cardVoucherNumber: resultDetails.ReferenceNo,
                        transactionId: newTransaction.id,
                        amount: parseFloat(item.price),
                        createdAt: new Date(),
                    },
                });

                return payment;
            });

            const payments = await Promise.all(paymentPromises);

            sendEmailPayment(customer.merchantCustomerId, data.amount);
            return res.status(200).json({
                msg: 'ok',
                error: false,
                data: {
                    id: data.id
                },
            });
        } else {
            const newTransaction = await prisma.transaction.upsert({
                create: {
                    type: data.paymentType,
                    state: transactionState,
                    trxId: data.id,
                    bankResponse: resultDetails.Response || '',
                    responseText: resultDetails.ExtendedDescription,
                    lot: resultDetails.BatchNo,
                    reference: resultDetails.ReferenceNo,
                    acquirerId: parseInt(customer.merchantCustomerId),
                    authorization: parseInt(resultDetails.AuthCode) || 0,
                    buttonResponse: result.code,
                    amount: parseFloat(data.amount),
                    interest: parseFloat(customParameters.SHOPPER_VAL_IVA),
                    totalAmount: parseFloat(data.amount),
                    jsonResponse: JSON.stringify(data)
                },
                update: {
                    type: data.paymentType,
                    state: transactionState,
                    trxId: data.id,
                    bankResponse: resultDetails.Response || '',
                    responseText: resultDetails.ExtendedDescription,
                    lot: resultDetails.BatchNo,
                    reference: resultDetails.ReferenceNo,
                    acquirerId: parseInt(customer.merchantCustomerId),
                    authorization: parseInt(resultDetails.AuthCode) || 0,
                    buttonResponse: result.code,
                    amount: parseFloat(data.amount),
                    interest: parseFloat(customParameters.SHOPPER_VAL_IVA),
                    totalAmount: parseFloat(data.amount),
                    jsonResponse: JSON.stringify(data)
                },
                where: { trxId: data.id }
            });
            return res.status(404).json({
                msg: `Pago fallido: ${data.result.description}`,
                error: true,
                data
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            msg: 'Something went wrong',
            error: error.response?.data || error
        });
    }
};


export const sendEmailPayment = async (
    req: Request,
    res: Response,
    userId?: number,
    totalAmount?: number) => {
    try {
        const idUser = userId || req.body.userId;
        const finalAmount = totalAmount || req.body.totalAmount;
        if (!idUser && !finalAmount) {
            return res.status(400).json({
                msg: "Se requiere email y monto",
                error: true,
                data: []
            });
        }
        const existingUser = await prisma.user.findFirst({ where: { id: userId} });
        const fromEmail = await prisma.param.findUnique({ where: { key: 'zimbra_user' } }) || '';
        const htmlEmail = await prisma.param.findUnique({ where: { key: 'PAYMENT_HTML_EMAIL' } }) || '';
        const titleEmail = await prisma.param.findUnique({ where: { key: 'PAYMENT_TITLE_EMAIL' } }) || '';

        const htmlEmailReplaced = htmlEmail.value.replace(
            /\${totalAmount}/g,
            finalAmount
        );
        if (fromEmail && existingUser && htmlEmailReplaced && existingUser)
            sendEmail(fromEmail.value || '', existingUser.email, '', htmlEmailReplaced, titleEmail.value, 'Info');

        return res.json({
            msg: `Correo de pago enviado correctamente`,
            error: false
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error: error,
            data: []

        });
    }
}