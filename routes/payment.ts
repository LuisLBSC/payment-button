import { Router } from "express";
import {getAllPaymentsByUser, getPaymentById, deletePaymentById}  from "../controller/payment";
import { validateJWT } from "../middlewares/validate-jwt";
import { check } from "express-validator";
import { validateFields } from "../middlewares/validate-fields";

const router = Router();

router.get('/', 
    validateJWT,
    getAllPaymentsByUser);
router.get('/:id', 
    validateJWT,
    getPaymentById);
router.delete('/:id', 
    validateJWT,
    deletePaymentById);

export default router;