"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentButton_1 = require("../controller/paymentButton");
const validate_jwt_1 = require("../middlewares/validate-jwt");
const express_validator_1 = require("express-validator");
const validate_fields_1 = require("../middlewares/validate-fields");
const router = (0, express_1.Router)();
router.post('/requestCheckout', [
    (0, express_validator_1.check)('customerId', 'Name is required').not().isEmpty(),
    (0, express_validator_1.check)('debtId', 'Name is required').not().isEmpty(),
    validate_fields_1.validateFields
], validate_jwt_1.validateJWT, paymentButton_1.requestCheckout);
router.post('/savePayment', [
    (0, express_validator_1.check)('checkoutId', 'Name is required').not().isEmpty(),
    validate_fields_1.validateFields
], validate_jwt_1.validateJWT, paymentButton_1.savePaymentWithCheckoutId);
exports.default = router;
//# sourceMappingURL=paymentButton.js.map