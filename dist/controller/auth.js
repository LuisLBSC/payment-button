"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendVerificationEmail = exports.verifyAccount = exports.signUp = exports.resetPassword = exports.login = void 0;
const client_1 = require("@prisma/client");
const generate_jwt_1 = require("../helpers/generate-jwt");
const password_1 = require("../helpers/password");
const mail_1 = require("./mail");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        let generatedToken;
        let validPassword = false;
        if (!username || !password)
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const existingUser = yield prisma.user.findFirst({ where: { username: username, active: 1 } });
        if (!existingUser) {
            return res.status(404).json({
                msg: 'User not found',
                error: true,
                data: []
            });
        }
        validPassword = yield (0, password_1.validatePassword)(password, existingUser.password);
        if (!validPassword) {
            const defaultEmails = (yield prisma.param.findUnique({ where: { key: 'DEFAULT_EMAILS' } })) || '';
            const defaultTextEmail = yield prisma.param.findUnique({ where: { key: 'DEFAULT_TEXT_EMAIL' } });
            const defaultHtmlEmail = yield prisma.param.findUnique({ where: { key: 'DEFAULT_HTML_EMAIL' } });
            if (!defaultEmails)
                (0, mail_1.sendEmail)(process.env.EMAIL || '', defaultEmails === null || defaultEmails === void 0 ? void 0 : defaultEmails.value, defaultTextEmail.value, defaultHtmlEmail === null || defaultHtmlEmail === void 0 ? void 0 : defaultHtmlEmail.value, 'Login Failed!', 'Info');
            return res.status(404).json({ msg: 'Invalid Password', error: false, data: log });
        }
        generatedToken = yield (0, generate_jwt_1.generateJWT)(existingUser.id);
        return res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: existingUser,
            token: generatedToken || ''
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error: error,
            data: []
        });
    }
});
exports.login = login;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, password, confirmPassword } = req.body;
        if (!(id || password || confirmPassword))
            res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const existingUser = yield prisma.user.findFirst({ where: { id, active: 1 } });
        if (!existingUser) {
            return res.status(404).json({ msg: 'User not found', error: true, data: [] });
        }
        const matchPasswords = yield (0, password_1.validatePassword)(password, existingUser.password);
        if (matchPasswords) {
            return res.status(400).json({ msg: 'New password cannot be the same as the old one', error: true, data: [] });
        }
        const encryptedPassword = yield (0, password_1.encryptPassword)(password);
        const updatedUser = yield prisma.user.update({
            where: { id },
            data: {
                password: encryptedPassword
            }
        });
        res.json({
            msg: `Username: ${updatedUser.username} -> Password changed successfully`,
            error: false
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error: error,
            data: []
        });
    }
});
exports.resetPassword = resetPassword;
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, email, name, middleName, lastname, phone, address, country, postCode, profileId } = req.body;
        if (!username || !password)
            return res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const existingUser = yield prisma.user.findFirst({ where: { username: username, active: 1 } });
        if (existingUser)
            return res.status(400).json({ msg: 'User already exists', error: true, data: [] });
        const encryptedPassword = yield (0, password_1.encryptPassword)(password);
        const verifiedToken = jsonwebtoken_1.default.sign(email, `${process.env.SECRETKEY}`, {});
        const newUser = yield prisma.user.create({
            data: {
                username,
                password: encryptedPassword,
                email,
                name,
                middleName,
                lastname,
                phone,
                address,
                country,
                postCode,
                verifiedToken,
                active: 1,
                profileId
            }
        });
        const htmlEmail = (yield prisma.param.findUnique({ where: { key: 'SIGNUP_HTML_EMAIL' } })) || '';
        const htmlEmailReplaced = htmlEmail.value.replace(/\${process\.env\.BASE_URL}/g, process.env.BASE_URL).replace(/\${verifiedToken}/g, verifiedToken);
        if (newUser.email && htmlEmailReplaced)
            (0, mail_1.sendEmail)(process.env.EMAIL || '', newUser.email, '', htmlEmailReplaced, 'Verificar usuario', 'Info');
        return res.json({
            msg: `Username: ${newUser.username} registed`,
            error: false,
            records: 1,
            data: newUser
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error: error,
            data: []
        });
    }
});
exports.signUp = signUp;
const verifyAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { verifiedToken } = req.params;
        if (!verifiedToken)
            return res.status(400).json({ msg: 'An error occurred while verifying account', error: true, records: 0, data: [] });
        const validateToken = jsonwebtoken_1.default.verify(verifiedToken, process.env.SECRETKEY || '');
        if (!validateToken)
            return res.status(400).json({ msg: 'Invalid token', error: true, records: 0, data: [] });
        const registeredUser = yield prisma.user.findUnique({ where: { email: validateToken } });
        if (!registeredUser)
            return res.status(404).json({ msg: 'User not found', error: true, data: [] });
        const { id } = registeredUser;
        const verifiedUser = yield prisma.user.update({
            where: { id },
            data: {
                verified: 1,
                verifiedToken: null
            }
        });
        res.status(200).json({
            registeredUser,
            msg: `User ${verifiedUser.username} verified`,
            error: false,
            records: 1
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error: error,
            data: []
        });
    }
});
exports.verifyAccount = verifyAccount;
const resendVerificationEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const registeredUser = yield prisma.user.findUnique({ where: { email } });
        if (!registeredUser)
            return res.status(404).json({ msg: 'User not found', error: true, data: [] });
        const verifiedToken = jsonwebtoken_1.default.sign(email, `${process.env.SECRETKEY}`, {});
        const { id } = registeredUser;
        const verifiedUser = yield prisma.user.update({
            where: { id },
            data: {
                verifiedToken
            }
        });
        const htmlEmail = (yield prisma.param.findUnique({ where: { key: 'SIGNUP_HTML_EMAIL' } })) || '';
        const htmlEmailReplaced = htmlEmail.value.replace(/\${process\.env\.BASE_URL}/g, process.env.BASE_URL).replace(/\${verifiedToken}/g, verifiedToken);
        if (email && htmlEmailReplaced)
            (0, mail_1.sendEmail)(process.env.EMAIL || '', email, '', htmlEmailReplaced, 'Verificar usuario', 'Info');
        return res.json({
            msg: `Verification email sent successfully`,
            error: false
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error: error,
            data: []
        });
    }
});
exports.resendVerificationEmail = resendVerificationEmail;
//# sourceMappingURL=auth.js.map