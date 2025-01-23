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
exports.deleteDebtById = exports.saveDebt = exports.getDebtById = exports.getAllDebtsByUser = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllDebtsByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { liquidationCode, localCode, actionLiquidationType, ext } = req.query;
        const filters = {};
        let localCodeExt = localCode;
        if (ext && ext.length > 0)
            localCodeExt = localCodeExt === null || localCodeExt === void 0 ? void 0 : localCodeExt.concat(` LC:${ext}`);
        if (liquidationCode)
            filters.liquidationCode = { contains: liquidationCode, mode: 'insensitive' };
        if (localCode)
            filters.localCode = { contains: localCodeExt, mode: 'insensitive' };
        if (actionLiquidationType)
            filters.actionLiquidationType = parseInt(actionLiquidationType, 10);
        const debts = yield prisma.debt.findMany({ where: filters });
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
const saveDebt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { liquidationId, titleName, liquidationCode, debtDate, shopperName, identification, courtCosts, localCode, plotId, actionLiquidationType, liquidationState, year, surcharge, discount, interest, coercive, totalAmount } = req.body;
        const newDebt = yield prisma.debt.create({
            data: {
                liquidationId,
                titleName,
                liquidationCode,
                debtDate,
                shopperName,
                identification,
                courtCosts,
                localCode,
                plotId,
                actionLiquidationType,
                liquidationState,
                year,
                surcharge,
                discount,
                interest,
                coercive,
                totalAmount
            }
        });
        res.json({
            newDebt,
            msg: `Debt ${newDebt.titleName} created`
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Something went wrong',
            error
        });
    }
});
exports.saveDebt = saveDebt;
const deleteDebtById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        yield prisma.debt.delete({ where: { id: idNumber } });
        res.status(200).json({
            msg: `Debt ${id} deleted`,
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
exports.deleteDebtById = deleteDebtById;
//# sourceMappingURL=debt.js.map