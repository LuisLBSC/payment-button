"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const entity_1 = require("../controller/entity");
const express_validator_1 = require("express-validator");
const validate_fields_1 = require("../middlewares/validate-fields");
const validate_jwt_1 = require("../middlewares/validate-jwt");
const router = (0, express_1.Router)();
router.get('/', validate_jwt_1.validateJWT, entity_1.getAllEntities);
router.get('/:id', validate_jwt_1.validateJWT, entity_1.getEntityById);
router.get('/getByName/:name', validate_jwt_1.validateJWT, entity_1.getEntityByName);
router.post('/', [
    (0, express_validator_1.check)('name', 'Name is required').not().isEmpty(),
    (0, express_validator_1.check)('description', 'Name is required').not().isEmpty(),
    validate_fields_1.validateFields
], validate_jwt_1.validateJWT, entity_1.saveEntity);
router.put('/:id', [
    (0, express_validator_1.check)('name', 'Name is required').not().isEmpty(),
    (0, express_validator_1.check)('description', 'Name is required').not().isEmpty(),
    validate_fields_1.validateFields
], validate_jwt_1.validateJWT, entity_1.updateEntityById);
router.put('/updateByName/:name', [
    (0, express_validator_1.check)('name', 'Name is required').not().isEmpty(),
    (0, express_validator_1.check)('description', 'Name is required').not().isEmpty(),
    validate_fields_1.validateFields
], validate_jwt_1.validateJWT, entity_1.updateEntityByName);
router.delete('/:id', validate_jwt_1.validateJWT, entity_1.deleteEntityById);
router.delete('/deleteByName/:name', validate_jwt_1.validateJWT, entity_1.deleteEntityByName);
exports.default = router;
//# sourceMappingURL=entity.js.map