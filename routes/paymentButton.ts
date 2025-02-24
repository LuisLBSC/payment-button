import { Router } from "express";
import {requestCheckout, savePaymentWithCheckoutId, sendEmailPayment}  from "../controller/paymentButton";
import { validateJWT } from "../middlewares/validate-jwt";
import { check } from "express-validator";
import { validateFields } from "../middlewares/validate-fields";

const router = Router();
router.post('/requestCheckout', 
    [
        check('customerId', 'customerId is required').not().isEmpty(),
        check('debtIds', 'debtIds is required').not().isEmpty(),
        validateFields
    ],
    validateJWT,
    requestCheckout);
router.post('/savePayment', 
    [
        check('checkoutId', 'checkoutId is required').not().isEmpty(),
        validateFields
    ],
    validateJWT,
    savePaymentWithCheckoutId);
router.post('/sendEmailPayment',
    validateJWT,
    sendEmailPayment);
export default router;