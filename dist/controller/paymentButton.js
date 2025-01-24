"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestCheckout = void 0;
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const querystring_1 = __importDefault(require("querystring"));
const prisma = new client_1.PrismaClient();
const requestCheckout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId, debtId, } = req.body;
        const customer = yield prisma.user.findFirst({ where: { id: customerId, active: 1 } });
        if (!customer) {
            return res.status(404).json({
                msg: 'Customer not found or inactive',
                error: true,
            });
        }
        const debt = yield prisma.debt.findFirst({ where: { id: debtId } });
        if (!debt) {
            return res.status(404).json({
                msg: 'Debt not found',
                error: true,
            });
        }
        const requestParams = yield prisma.param.findMany({
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
        req.ip;
        const { entityId, token, mid, tid, currency } = paramsMap;
        const missingParams = [];
        if (!entityId)
            missingParams.push('entityId');
        if (!token)
            missingParams.push('token');
        if (!mid)
            missingParams.push('mid');
        if (!tid)
            missingParams.push('tid');
        if (!currency)
            missingParams.push('currency');
        if (missingParams.length > 0) {
            return res.status(400).json({
                msg: `Missing required parameters: ${missingParams.join(', ')}`,
                error: true,
            });
        }
        const base0 = 0;
        const base15 = 0.15;
        const tax = (debt === null || debt === void 0 ? void 0 : debt.totalAmount) * base15;
        const query = querystring_1.default.stringify({
            entityId,
            amount: debt === null || debt === void 0 ? void 0 : debt.totalAmount,
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
            'cart.items[0].price': debt === null || debt === void 0 ? void 0 : debt.totalAmount,
            'cart.items[0].quantity': 1,
            'customParameters[SHOPPER_VERSIONDF]': '2',
            'testMode': 'EXTERNAL'
        });
        const url = `${process.env.DATAFAST_URL}${process.env.DATAFAST_URL_PATH}?${query}`;
        const { data } = yield axios_1.default.post(url, {}, {
            headers: {
                Authorization: `Bearer ${paramsMap.token}`,
            },
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
        });
        console.log({ data });
        return res.status(200).json({
            msg: 'ok',
            error: false,
            data,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            msg: 'Error al crear el checkout',
            error,
        });
    }
});
exports.requestCheckout = requestCheckout;
//# sourceMappingURL=paymentButton.js.map