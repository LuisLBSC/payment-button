"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const debt_1 = require("../controller/debt");
const validate_jwt_1 = require("../middlewares/validate-jwt");
const express_validator_1 = require("express-validator");
const validate_fields_1 = require("../middlewares/validate-fields");
const router = (0, express_1.Router)();
router.get('/', validate_jwt_1.validateJWT, debt_1.getAllDebtsByUser);
router.get('/:id', validate_jwt_1.validateJWT, debt_1.getDebtById);
router.post('/', [
    (0, express_validator_1.check)('customerId', 'Name is required').not().isEmpty(),
    (0, express_validator_1.check)('titleName', 'Name is required').not().isEmpty(),
    (0, express_validator_1.check)('shopperName', 'Name is required').not().isEmpty(),
    (0, express_validator_1.check)('localCode', 'Name is required').not().isEmpty(),
    (0, express_validator_1.check)('plotId', 'Name is required').not().isEmpty(),
    (0, express_validator_1.check)('actionLiquidationType', 'Name is required').not().isEmpty(),
    (0, express_validator_1.check)('liquidationState', 'Name is required').not().isEmpty(),
    (0, express_validator_1.check)('year', 'Name is required').not().isEmpty(),
    validate_fields_1.validateFields
], validate_jwt_1.validateJWT, debt_1.saveDebt);
exports.default = router;
//# sourceMappingURL=debt.js.map