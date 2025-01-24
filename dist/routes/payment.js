"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_1 = require("../controller/payment");
const validate_jwt_1 = require("../middlewares/validate-jwt");
const router = (0, express_1.Router)();
router.get('/', payment_1.getAllPaymentsByUser);
router.get('/:id', validate_jwt_1.validateJWT, payment_1.getPaymentById);
router.delete('/:id', validate_jwt_1.validateJWT, payment_1.deletePaymentById);
exports.default = router;
//# sourceMappingURL=payment.js.map