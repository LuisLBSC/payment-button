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
exports.deleteEntityByName = exports.deleteEntityById = exports.updateEntityByName = exports.updateEntityById = exports.saveEntity = exports.getEntityByName = exports.getEntityById = exports.getAllEntities = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllEntities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const entities = yield prisma.entity.findMany({ where: { active: 1 } });
        res.json({
            msg: 'ok',
            error: false,
            records: entities.length,
            data: entities
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error obteniendo entidades',
            error
        });
    }
});
exports.getAllEntities = getAllEntities;
const getEntityById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const existingEntity = yield prisma.entity.findFirst({ where: { id: idNumber } });
        if (!existingEntity)
            res.status(404).json({ msg: 'Entidad no encontrada', error: false, data: [] });
        res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: existingEntity
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error obteniendo entidades',
            error: error,
            data: []
        });
    }
});
exports.getEntityById = getEntityById;
const getEntityByName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.params;
        if (!name)
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const existingEntity = yield prisma.entity.findFirst({ where: { name } });
        if (!existingEntity)
            res.status(404).json({ msg: 'Entidad no encontrada', error: false, data: [] });
        res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: existingEntity
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error obteniendo entidades',
            error: error,
            data: []
        });
    }
});
exports.getEntityByName = getEntityByName;
const saveEntity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        const newEntity = yield prisma.entity.upsert({
            create: { name, description },
            update: { name, description },
            where: { name }
        });
        res.json({
            newEntity,
            msg: `Entidad ${newEntity.name} creada`
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
exports.saveEntity = saveEntity;
const updateEntityById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        const { name, description } = req.body;
        if (!id || isNaN(idNumber))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const existingEntity = yield prisma.entity.findFirst({ where: { id: idNumber } });
        if (!existingEntity)
            res.status(404).json({ msg: 'Entidad no encontrada', error: false, data: [] });
        yield prisma.entity.update({
            where: {
                id: idNumber
            },
            data: {
                name,
                description
            }
        });
        res.status(200).json({
            msg: `Entidad ${name} actualizada`,
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
exports.updateEntityById = updateEntityById;
const updateEntityByName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.params;
        const { description } = req.body;
        if (!name)
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const existingEntity = yield prisma.entity.findFirst({ where: { name } });
        if (!existingEntity)
            res.status(404).json({ msg: 'Entidad no encontrada', error: false, data: [] });
        yield prisma.entity.update({
            where: {
                name
            },
            data: {
                description
            }
        });
        res.status(200).json({
            msg: `Entidad ${name} actualizada`,
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
exports.updateEntityByName = updateEntityByName;
const deleteEntityById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const idNumber = parseInt(id, 10);
        if (!id || isNaN(idNumber))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        yield prisma.entity.update({
            where: {
                id: idNumber
            },
            data: {
                active: 0
            }
        });
        res.status(200).json({
            msg: `Entidad ${id} eliminada`,
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
exports.deleteEntityById = deleteEntityById;
const deleteEntityByName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.params;
        if (!name)
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        yield prisma.entity.update({
            where: {
                name
            },
            data: {
                active: 0
            }
        });
        res.status(200).json({
            msg: `Entidad ${name} eliminada`,
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
exports.deleteEntityByName = deleteEntityByName;
//# sourceMappingURL=entity.js.map