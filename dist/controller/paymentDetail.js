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
exports.getPaymentDetailById = exports.getAllPaymentDetails = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllPaymentDetails = (req, res, paymentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { paymentId } = req.body;
        const paymentDetails = yield prisma.paymentDetail.findMany({ where: { paymentId } });
        res.json({
            msg: 'ok',
            error: false,
            records: paymentDetails.length,
            data: paymentDetails
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting payment detail',
            error: error,
            data: []
        });
    }
});
exports.getAllPaymentDetails = getAllPaymentDetails;
const getPaymentDetailById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const existingPaymentDetail = yield prisma.paymentDetail.findFirst({ where: { id: idNumber } });
        if (!existingPaymentDetail)
            res.status(404).json({ msg: 'Payment not found', error: false, data: [] });
        res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: existingPaymentDetail
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting payment detail',
            error: error,
            data: []
        });
    }
});
exports.getPaymentDetailById = getPaymentDetailById;
//# sourceMappingURL=paymentDetail.js.map