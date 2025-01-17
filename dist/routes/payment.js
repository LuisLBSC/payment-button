"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_1 = require("../controller/payment");
const validate_jwt_1 = require("../middlewares/validate-jwt");
const express_validator_1 = require("express-validator");
const validate_fields_1 = require("../middlewares/validate-fields");
const router = (0, express_1.Router)();
router.get('/', payment_1.getAllPaymentsByUser);
router.get('/:id', validate_jwt_1.validateJWT, payment_1.getPaymentById);
router.post('/', [
    (0, express_validator_1.check)('customerId', 'Name is required').not().isEmpty(),
    (0, express_validator_1.check)('debtId', 'Name is required').not().isEmpty(),
    (0, express_validator_1.check)('cashier', 'Name is required').not().isEmpty(),
    (0, express_validator_1.check)('receiptNumber', 'Name is required').not().isEmpty(),
    validate_fields_1.validateFields
], validate_jwt_1.validateJWT, payment_1.savePayment);
router.put('/:id', [
    (0, express_validator_1.check)('customerId', 'Name is required').not().isEmpty(),
    (0, express_validator_1.check)('debtId', 'Name is required').not().isEmpty(),
    (0, express_validator_1.check)('cashier', 'Name is required').not().isEmpty(),
    (0, express_validator_1.check)('receiptNumber', 'Name is required').not().isEmpty(),
    validate_fields_1.validateFields
], validate_jwt_1.validateJWT, payment_1.updatePaymentById);
router.delete('/:id', validate_jwt_1.validateJWT, payment_1.deletePaymentById);
exports.default = router;
//# sourceMappingURL=payment.js.map