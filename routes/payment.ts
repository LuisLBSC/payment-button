import { Router } from "express";
import {getAllPaymentsByUser, getPaymentById, savePayment, updatePaymentById, deletePaymentById}  from "../controller/payment";
import { validateJWT } from "../middlewares/validate-jwt";
import { check } from "express-validator";
import { validateFields } from "../middlewares/validate-fields";

const router = Router();

router.get('/', getAllPaymentsByUser);
router.get('/:id', 
    validateJWT,
    getPaymentById);
router.post('/', 
    [
        check('customerId', 'Name is required').not().isEmpty(),
        check('debtId', 'Name is required').not().isEmpty(),
        check('cashier', 'Name is required').not().isEmpty(),
        check('receiptNumber', 'Name is required').not().isEmpty(),
        validateFields
    ],
    validateJWT,
    savePayment);
router.put('/:id', 
    [
        check('customerId', 'Name is required').not().isEmpty(),
        check('debtId', 'Name is required').not().isEmpty(),
        check('cashier', 'Name is required').not().isEmpty(),
        check('receiptNumber', 'Name is required').not().isEmpty(),
        validateFields
    ],
    validateJWT,
    updatePaymentById);
router.delete('/:id', 
    validateJWT,
    deletePaymentById);

export default router;