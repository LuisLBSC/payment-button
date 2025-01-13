"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controller/auth");
const user_1 = require("../controller/user");
const express_validator_1 = require("express-validator");
const validate_fields_1 = require("../middlewares/validate-fields");
const router = (0, express_1.Router)();
router.post('/login', [
    (0, express_validator_1.check)('username', 'Username is required').not().isEmpty(),
    (0, express_validator_1.check)('password', 'Password is required').not().isEmpty(),
    validate_fields_1.validateFields
], auth_1.login);
router.post('/forgotPassword', [
    (0, express_validator_1.check)('username', 'Username is required').not().isEmpty(),
    validate_fields_1.validateFields
], user_1.getUserByUsername);
router.post('/resetPassword', [
    (0, express_validator_1.check)('id', 'Id es required').not().isEmpty(),
    (0, express_validator_1.check)('password', 'Password is required').not().isEmpty(),
    (0, express_validator_1.check)('confirmPassword', 'Confirm Password is required').not().isEmpty(),
    (0, express_validator_1.check)('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Passwords don't match");
        }
        return true;
    }),
    validate_fields_1.validateFields
], auth_1.resetPassword);
exports.default = router;
//# sourceMappingURL=auth.js.map