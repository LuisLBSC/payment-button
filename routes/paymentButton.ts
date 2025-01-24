import { Router } from "express";
import {requestCheckout, savePaymentWithCheckoutId}  from "../controller/paymentButton";
import { validateJWT } from "../middlewares/validate-jwt";
import { check } from "express-validator";
import { validateFields } from "../middlewares/validate-fields";

const router = Router();
router.post('/requestCheckout', 
    [
        check('customerId', 'Name is required').not().isEmpty(),
        check('debtId', 'Name is required').not().isEmpty(),
        validateFields
    ],
    validateJWT,
    requestCheckout);
router.post('/savePayment', 
    [
        check('checkoutId', 'Name is required').not().isEmpty(),
        validateFields
    ],
    validateJWT,
    savePaymentWithCheckoutId);

export default router;