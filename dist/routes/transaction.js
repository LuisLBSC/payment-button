"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_1 = require("../controller/transaction");
const validate_jwt_1 = require("../middlewares/validate-jwt");
const router = (0, express_1.Router)();
router.get('/', validate_jwt_1.validateJWT, transaction_1.getAllTransactions);
//# sourceMappingURL=transaction.js.map