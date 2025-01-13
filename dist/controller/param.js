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
exports.deleteParamByKey = exports.deleteParamById = exports.updateParamByKey = exports.updateParamById = exports.saveParam = exports.getParamByKey = exports.getParamById = exports.getAllParams = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllParams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = yield prisma.param.findMany({ where: { active: 1 } });
        res.json({
            msg: 'ok',
            error: false,
            records: params.length,
            data: params
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting params',
            error
        });
    }
});
exports.getAllParams = getAllParams;
const getParamById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const existingParam = yield prisma.param.findFirst({ where: { id: idNumber } });
        if (!existingParam)
            res.status(404).json({ msg: 'Param not found', error: false, data: [] });
        res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: existingParam
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting param',
            error: error,
            data: []
        });
    }
});
exports.getParamById = getParamById;
const getParamByKey = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key } = req.params;
        if (!key)
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const existingParam = yield prisma.param.findFirst({ where: { key } });
        if (!existingParam)
            res.status(404).json({ msg: 'Param not found', error: false, data: [] });
        res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: existingParam
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error getting param',
            error: error,
            data: []
        });
    }
});
exports.getParamByKey = getParamByKey;
const saveParam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, value } = req.body;
        const newParam = yield prisma.param.upsert({
            create: { key, value },
            update: { key, value },
            where: { key }
        });
        res.json({
            newParam,
            msg: `Param ${newParam.key} created`
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
exports.saveParam = saveParam;
const updateParamById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        const { key, value } = req.body;
        if (!id || isNaN(idNumber))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const existingParam = yield prisma.param.findFirst({ where: { id: idNumber } });
        if (!existingParam)
            res.status(404).json({ msg: 'Param not found', error: false, data: [] });
        yield prisma.param.update({
            where: {
                id: idNumber
            },
            data: {
                key,
                value
            }
        });
        res.status(200).json({
            msg: `Param ${key} updated`,
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
exports.updateParamById = updateParamById;
const updateParamByKey = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key } = req.params;
        const { value } = req.body;
        if (!key)
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const existingParam = yield prisma.param.findFirst({ where: { key } });
        if (!existingParam)
            res.status(404).json({ msg: 'Param not found', error: false, data: [] });
        yield prisma.param.update({
            where: {
                key
            },
            data: {
                value
            }
        });
        res.status(200).json({
            msg: `Param ${key} updated`,
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
exports.updateParamByKey = updateParamByKey;
const deleteParamById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        yield prisma.param.update({
            where: {
                id: idNumber
            },
            data: {
                active: 0
            }
        });
        res.status(200).json({
            msg: `Param ${id} deleted`,
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
exports.deleteParamById = deleteParamById;
const deleteParamByKey = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key } = req.params;
        if (!key)
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        yield prisma.param.update({
            where: {
                key
            },
            data: {
                active: 0
            }
        });
        res.status(200).json({
            msg: `Param ${key} deleted`,
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
exports.deleteParamByKey = deleteParamByKey;
//# sourceMappingURL=param.js.map