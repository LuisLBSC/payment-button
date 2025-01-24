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

      const customer = await prisma.user.findFirst({where: {id: customerId, active: 1}});
      if (!customer) {
        return res.status(404).json({
            msg: 'Customer not found or inactive',
            error: true,
        });
      }
      const debt = await prisma.debt.findFirst({where: {id: debtId}});
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

      const paramsMap = requestParams.reduce((acc, param) => {
          const key = param.key.replace('request_', '');
          acc[key] = param.value;
          return acc;
      }, {});
      req.ip
      const { entityId, token, mid, tid, currency } = paramsMap;
      const missingParams = [];
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
      const base15 = 0.15
      const tax = debt?.totalAmount * base15;
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
          'merchantTransactionId': `transaction_${Date.now()}`,
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
          'customParameters[SHOPPER_VERSIONDF]':'2',
          'testMode':'EXTERNAL'
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

      console.log({ data });
      return res.status(200).json({
          msg: 'ok',
          error: false,
          data,
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({
          msg: 'Error al crear el checkout',
          error,
      });
  }
};