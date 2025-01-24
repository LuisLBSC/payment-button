import { Router } from "express";
import {requestCheckout}  from "../controller/paymentButton";
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
    //validateJWT,
    requestCheckout);

export default router;