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
exports.getAllTransactions = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { trxId, lot, state } = req.query;
        const filters = {};
        const dateStart = req.query.dateStart;
        const dateEnd = req.query.dateEnd;
        if (trxId)
            filters.trxId = { contains: trxId, mode: 'insensitive' };
        if (lot)
            filters.lot = { contains: lot, mode: 'insensitive' };
        if (state)
            filters.state = { contains: state, mode: 'insensitive' };
        if (!dateStart || !dateEnd) {
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            filters.executionDate = {
                gte: threeDaysAgo,
                lte: new Date()
            };
        }
        else {
            filters.executionDate = {};
            if (dateStart)
                filters.executionDate.gte = new Date(dateStart);
            if (dateEnd)
                filters.executionDate.lte = new Date(dateEnd);
        }
        const transaction = yield prisma.transaction.findMany({
            include: { acquirer: true },
            where: filters,
            orderBy: { executionDate: 'desc' }
        });
        res.json({
            msg: 'ok',
            error: false,
            records: transaction.length,
            data: transaction
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting transactions',
            error
        });
    }
});
exports.getAllTransactions = getAllTransactions;
//# sourceMappingURL=transaction.js.map