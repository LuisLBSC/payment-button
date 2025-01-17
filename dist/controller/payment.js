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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePaymentById = exports.updatePaymentById = exports.savePayment = exports.getPaymentById = exports.getAllPaymentsByUser = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllPaymentsByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const payments = yield prisma.payment.findMany({ where: { customerId: id } });
        res.json({
            msg: 'ok',
            error: false,
            records: payments.length,
            data: payments
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting payments',
            error
        });
    }
});
exports.getAllPaymentsByUser = getAllPaymentsByUser;
const getPaymentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const existingPayment = yield prisma.payment.findFirst({ where: { id: idNumber } });
        if (!existingPayment)
            res.status(404).json({ msg: 'Payment not found', error: false, data: [] });
        res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: existingPayment
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting payment',
            error: error,
            data: []
        });
    }
});
exports.getPaymentById = getPaymentById;
const savePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ipSession = req.ip;
        const { customerId, debtId, cashier, observation, macAddressUser, receiptNumber } = req.body;
        const newPayment = yield prisma.payment.upsert({
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
            where: { receiptNumber }
        });
        res.json({
            newPayment,
            msg: `Payment with checkout_id ${newPayment.receiptNumber} processed`
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error
        });
    }
});
exports.savePayment = savePayment;
const updatePaymentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        const ipSession = req.ip;
        const { customerId, debtId, cashier, observation, macAddressUser, receiptNumber } = req.body;
        if (!id || isNaN(idNumber))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const existingPayment = yield prisma.payment.findFirst({ where: { id: idNumber } });
        if (!existingPayment)
            res.status(404).json({ msg: 'Payment not found', error: false, data: [] });
        const updatedPayment = yield prisma.payment.update({
            where: {
                id: idNumber
            },
            data: {
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
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error
        });
    }
});
exports.updatePaymentById = updatePaymentById;
const deletePaymentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        yield prisma.payment.update({
            where: {
                id: idNumber
            },
            data: {
                status: 0
            }
        });
        res.status(200).json({
            msg: `Payment with checkout_id ${id} deleted`,
            error: false
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error
        });
    }
});
exports.deletePaymentById = deletePaymentById;
//# sourceMappingURL=payment.js.map