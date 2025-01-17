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
exports.getDebtById = exports.getAllDebtsByUser = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllDebtsByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const debts = yield prisma.debt.findMany({ where: { customerId: id } });
        res.json({
            msg: 'ok',
            error: false,
            records: debts.length,
            data: debts
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
exports.getAllDebtsByUser = getAllDebtsByUser;
const getDebtById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const existingDebt = yield prisma.debt.findFirst({ where: { id: idNumber } });
        if (!existingDebt)
            res.status(404).json({ msg: 'Debt not found', error: false, data: [] });
        res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: existingDebt
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting debt',
            error: error,
            data: []
        });
    }
});
exports.getDebtById = getDebtById;
//# sourceMappingURL=debt.js.map