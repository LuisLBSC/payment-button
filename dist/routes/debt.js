"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const debt_1 = require("../controller/debt");
const validate_jwt_1 = require("../middlewares/validate-jwt");
const router = (0, express_1.Router)();
router.get('/', validate_jwt_1.validateJWT, debt_1.getAllDebtsByFilters);
router.get('/:id', validate_jwt_1.validateJWT, debt_1.getDebtById);
exports.default = router;
//# sourceMappingURL=debt.js.map