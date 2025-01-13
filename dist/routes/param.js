"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const param_1 = require("../controller/param");
const express_validator_1 = require("express-validator");
const validate_fields_1 = require("../middlewares/validate-fields");
const validate_jwt_1 = require("../middlewares/validate-jwt");
const router = (0, express_1.Router)();
router.get('/', param_1.getAllParams);
router.get('/:id', validate_jwt_1.validateJWT, param_1.getParamById);
router.get('/getByKey/:key', validate_jwt_1.validateJWT, param_1.getParamByKey);
router.post('/', [
    (0, express_validator_1.check)('key', 'Key is required').not().isEmpty(),
    (0, express_validator_1.check)('value', 'Value is required').not().isEmpty(),
    validate_fields_1.validateFields
], validate_jwt_1.validateJWT, param_1.saveParam);
router.put('/:id', [
    (0, express_validator_1.check)('key', 'Key is required').not().isEmpty(),
    (0, express_validator_1.check)('value', 'Value is required').not().isEmpty(),
    validate_fields_1.validateFields
], validate_jwt_1.validateJWT, param_1.updateParamById);
router.put('updateByKey/:key', [
    (0, express_validator_1.check)('key', 'Key is required').not().isEmpty(),
    (0, express_validator_1.check)('value', 'Value is required').not().isEmpty(),
    validate_fields_1.validateFields
], validate_jwt_1.validateJWT, param_1.updateParamByKey);
router.delete('/:id', validate_jwt_1.validateJWT, param_1.deleteParamById);
router.delete('deleteByKey/:key', validate_jwt_1.validateJWT, param_1.deleteParamByKey);
exports.default = router;
//# sourceMappingURL=param.js.map