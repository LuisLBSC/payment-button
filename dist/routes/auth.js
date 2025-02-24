"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controller/auth");
const user_1 = require("../controller/user");
const express_validator_1 = require("express-validator");
const validate_fields_1 = require("../middlewares/validate-fields");
const validate_jwt_1 = require("../middlewares/validate-jwt");
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
router.get('/checkAuthStatus', validate_jwt_1.validateAuthStatus);
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
router.post('/signUp', (0, express_validator_1.check)('username', 'Username is required').not().isEmpty(), (0, express_validator_1.check)('password', 'Password is required').not().isEmpty(), (0, express_validator_1.check)('email', 'Email is required').not().isEmpty(), validate_fields_1.validateFields, auth_1.signUp);
router.get('/verifyAccount/:verifiedToken', auth_1.verifyAccount);
router.post('/resendVerificationEmail', (0, express_validator_1.check)('email', 'Email is required').not().isEmpty(), validate_fields_1.validateFields, auth_1.resendVerificationEmail);
exports.default = router;
//# sourceMappingURL=auth.js.map