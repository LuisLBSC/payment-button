"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const entityWithRoles_1 = require("../controller/entityWithRoles");
const validate_jwt_1 = require("../middlewares/validate-jwt");
const router = (0, express_1.Router)();
router.get('/', validate_jwt_1.validateJWT, entityWithRoles_1.getEntitiesWithRoles);
router.post('/', validate_jwt_1.validateJWT, entityWithRoles_1.saveEntitiesWithRoles);
exports.default = router;
//# sourceMappingURL=entityWithRoles.js.map