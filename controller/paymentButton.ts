import { PrismaClient } from "@prisma/client";
import e, { Request, Response } from "express";
import axios from 'axios';
import querystring from 'querystring';

const prisma = new PrismaClient();

export const requestCheckout = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {
            customerId,
            debtId,
        } = req.body;

        const customer = await prisma.user.findFirst({ where: { id: customerId, active: 1 } });
        if (!customer) {
            return res.status(404).json({
                msg: 'Customer not found or inactive',
                error: true,
            });
        }
        const debt = await prisma.debt.findFirst({ where: { id: debtId } });
        if (!debt) {
            return res.status(404).json({
                msg: 'Debt not found',
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

        const { entityId, token, mid, tid, currency } = paramsMap;
        const missingParams: string[] = [];
        if (!entityId) missingParams.push('entityId');
        if (!token) missingParams.push('token');
        if (!mid) missingParams.push('mid');
        if (!tid) missingParams.push('tid');
        if (!currency) missingParams.push('currency');

        if (missingParams.length > 0) {
            return res.status(400).json({
                msg: `Missing required parameters: ${missingParams.join(', ')}`,
                error: true,
            });
        }

        const base0 = 0;
        const base15 = 0.15;
        const tax = debt?.totalAmount * base15;
        const transaction = `transaction#${Date.now()}`;
        const query = querystring.stringify({
            entityId,
            amount: debt?.totalAmount,
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
            'risk.parameters[SHOPPER_MID]': mid,
            'customParameters[SHOPPER_TID]': tid,
            'customParameters[SHOPPER_ECI]': '0103910',
            'customParameters[SHOPPER_PSERV]': '17913101',
            'customParameters[SHOPPER_VAL_BASE0]': base0,
            'customParameters[SHOPPER_VAL_BASEIMP]': base15,
            'customParameters[SHOPPER_VAL_IVA]': tax,
            'cart.items[0].name': debt.titleName,
            'cart.items[0].description': `Description: ${debt.titleName}`,
            'cart.items[0].price': debt?.totalAmount,
            'cart.items[0].quantity': 1,
            'customParameters[SHOPPER_VERSIONDF]': '2',
            'testMode': 'EXTERNAL'
        });

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
            const existingPayment = await prisma.payment.findFirst({
                where: {
                    debtId: debt.id,
                    receiptNumber: data.id,
                }
            });
            
            if (existingPayment) {
                const updatedPayment = await prisma.payment.update({
                    where: { id: existingPayment.id },
                    data: {
                        customerId,
                        observation: '',
                        macAddressUser: '',
                        ipSession: req.ip,
                    }
                });
            
                const newTransaction = await prisma.transaction.create({
                    data: {
                        id: transaction,
                        state: 'P',
                        checkoutId: data.id,
                        debtId: debt.id,
                        paymentId: updatedPayment.id,
                    }
                });
            
            } else {
                const newPayment = await prisma.payment.create({
                    data: {
                        customerId,
                        debtId,
                        cashier: 30,
                        observation: '',
                        macAddressUser: '',
                        ipSession: req.ip,
                        receiptNumber: data.id
                    }
                });

                const newTransaction = await prisma.transaction.create({
                    data: {
                        id: transaction,
                        state: 'P',
                        checkoutId: data.id,
                        debtId: debt.id,
                        paymentId: newPayment.id
                    }
                });
            }    

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
                msg: 'Error getting checkoutId',
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
                msg: 'checkoutId is required',
                error: true,
            });
        }
        const transaction = await prisma.transaction.findFirst({ where: { checkoutId }, });

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
                msg: `Missing required parameters: ${missingParams.join(', ')}`,
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
                //params,
                httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
            }
        );
        console.log("Respuesta del servidor:", data);
        if (data.card) {
            const { card, result, resultDetails } = data;
            const newPaymentDetail = await prisma.paymentDetail.create({
                data: {
                    paymentId: transaction?.paymentId ?? 0,
                    bank_id: 1,
                    cardNumber: card.last4Digits,
                    cardExpirationDate: `${card.expiryMonth.slice(-2)}${card.expiryYear.toString().slice(-2)}`,
                    cardAuthorization: result.code,
                    cardVoucherNumber: resultDetails.ConnectorTxID1,
                    cardHolderName: card.holder,
                    message: result.description,
                },
            });

            await prisma.transaction.update({
                where: {
                    id: transaction?.id,
                },
                data: {
                    state: 'S'
                }
            });

            return res.status(200).json({
                msg: 'ok',
                error: false,
                data: {
                    id: data.id
                },
            });
        } else {
            return res.status(404).json({
                msg: `Unsuccessful payment: ${data.result.description}`,
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
