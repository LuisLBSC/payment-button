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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
        const existingUser = yield prisma.user.findFirst({
            where: { username: username, active: 1 },
            include: {
                profile: {
                    include: {
                        roles: {
                            include: {
                                role: {
                                    include: {
                                        entities: {
                                            include: {
                                                entity: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!existingUser) {
            return res.status(404).json({
                msg: 'Usuario no encontrado',
                error: true,
                data: []
            });
        }
        const entityMap = new Map();
        const userProfile = existingUser === null || existingUser === void 0 ? void 0 : existingUser.profile;
        if (!userProfile) {
            return res.status(400).json({
                msg: 'Usuario sin perfil asignado',
                error: true,
                data: []
            });
        }
        if (!existingUser.verified) {
            return res.status(403).json({
                msg: 'Usuario no verificado',
                error: true,
                data: []
            });
        }
        userProfile.roles.forEach((profileRole) => {
            profileRole.role.entities.forEach((roleEntity) => {
                const entityId = roleEntity.entity.id;
                if (!entityMap.has(entityId)) {
                    entityMap.set(entityId, {
                        id: roleEntity.entity.id,
                        name: roleEntity.entity.name,
                        description: roleEntity.entity.description,
                        active: roleEntity.entity.active,
                        roles: []
                    });
                }
                entityMap.get(entityId).roles.push({
                    id: profileRole.role.id,
                    name: profileRole.role.name,
                    description: profileRole.role.description,
                    active: profileRole.role.active
                });
            });
        });
        const userWithEntities = {
            id: existingUser.id,
            username: existingUser.username,
            email: existingUser.email,
            active: existingUser.active,
            createdAt: existingUser.updatedAt,
            updatedAt: existingUser.updatedAt,
            verified: existingUser.verified,
            verifiedToken: existingUser.verifiedToken,
            lastname: existingUser.lastname,
            name: existingUser.name,
            address: existingUser.address,
            country: existingUser.country,
            middlename: existingUser.middlename,
            phone: existingUser.phone,
            postCode: existingUser.postCode,
            profile: {
                id: userProfile.id,
                name: userProfile.name,
                description: userProfile.description,
                active: userProfile.active,
                entities: Array.from(entityMap.values())
            }
        };
        validPassword = yield (0, password_1.validatePassword)(password, existingUser.password);
        if (!validPassword) {
            const fromEmail = (yield prisma.param.findUnique({ where: { key: 'zimbra_user' } })) || '';
            const defaultEmails = yield prisma.param.findUnique({ where: { key: 'DEFAULT_EMAILS' } });
            const titleEmail = (yield prisma.param.findUnique({ where: { key: 'LOGIN_ERROR_TITLE_EMAIL' } })) || '';
            const logintHtmlEmail = yield prisma.param.findUnique({ where: { key: 'LOGIN_ERROR_HTML_EMAIL' } });
            if (fromEmail && defaultEmails && logintHtmlEmail && titleEmail)
                (0, mail_1.sendEmail)(fromEmail.value || '', existingUser.email, '', logintHtmlEmail.value, titleEmail.value, 'Info');
            else {
                return res.status(400).json({ msg: 'Contraseña no válida y faltan parámetros requeridos para envio de correos', error: false, data: [] });
            }
            return res.status(401).json({ msg: 'Contraseña incorrecta', error: false, data: [] });
        }
        generatedToken = yield (0, generate_jwt_1.generateJWT)(userWithEntities.id);
        return res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: userWithEntities,
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
            return res.status(404).json({ msg: 'Usuario no encontrado', error: true, data: [] });
        }
        const matchPasswords = yield (0, password_1.validatePassword)(password, existingUser.password);
        if (matchPasswords) {
            return res.status(400).json({ msg: 'Nueva contraseña no puede ser igual que la anterior', error: true, data: [] });
        }
        const encryptedPassword = yield (0, password_1.encryptPassword)(password);
        const updatedUser = yield prisma.user.update({
            where: { id },
            data: {
                password: encryptedPassword
            }
        });
        res.json({
            msg: `Usuario: ${updatedUser.username} -> contraseña cambiada con éxito`,
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
        console.log(req.body);
        const defaultProfile = yield prisma.profile.findFirst({
            where: { name: "CUSTOMER" }
        });
        const { username, password, email, name, middlename, lastname, phone, address, country, postCode } = req.body;
        if (!username || !password)
            return res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        const existingUser = yield prisma.user.findFirst({ where: { username: username, active: 1 } });
        if (existingUser)
            return res.status(409).json({ msg: 'Usuario ya existe', error: true, data: [] });
        const encryptedPassword = yield (0, password_1.encryptPassword)(password);
        const verifiedToken = jsonwebtoken_1.default.sign(email, `${process.env.SECRETKEY}`, {});
        const newUser = yield prisma.user.create({
            data: {
                username,
                password: encryptedPassword,
                email,
                name,
                middlename,
                lastname,
                phone,
                address,
                country,
                postCode,
                verifiedToken,
                active: 1,
                profileId: defaultProfile === null || defaultProfile === void 0 ? void 0 : defaultProfile.id
            }
        });
        const { password: _ } = newUser, userWithoutPassword = __rest(newUser, ["password"]);
        const fromEmail = (yield prisma.param.findUnique({ where: { key: 'zimbra_user' } })) || '';
        const titleEmail = (yield prisma.param.findUnique({ where: { key: 'SIGNUP_TITLE_EMAIL' } })) || '';
        const htmlEmail = (yield prisma.param.findUnique({ where: { key: 'SIGNUP_HTML_EMAIL' } })) || '';
        const htmlEmailReplaced = htmlEmail.value.replace(/\${process\.env\.BASE_URL}/g, process.env.BASE_URL).replace(/\${verifiedToken}/g, verifiedToken);
        if (fromEmail && newUser.email && htmlEmailReplaced && titleEmail)
            (0, mail_1.sendEmail)(fromEmail.value || '', newUser.email, '', htmlEmailReplaced, titleEmail.value, 'Info');
        return res.json({
            msg: `Usuario: ${newUser.username} registrado`,
            error: false,
            records: 1,
            data: userWithoutPassword
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
            return res.status(400).json({ msg: 'Se produjo un error al verificar la cuenta.', error: true, records: 0, data: [] });
        const validateToken = jsonwebtoken_1.default.verify(verifiedToken, process.env.SECRETKEY || '');
        if (!validateToken)
            return res.status(400).json({ msg: 'Token inválido', error: true, records: 0, data: [] });
        const registeredUser = yield prisma.user.findUnique({ where: { email: validateToken } });
        if (!registeredUser)
            return res.status(404).json({ msg: 'Usuario no encontrado', error: true, data: [] });
        const { id } = registeredUser;
        const verifiedUser = yield prisma.user.update({
            where: { id },
            data: {
                verified: 1,
                verifiedToken: null
            }
        });
        const { password: _ } = verifiedUser, userWithoutPassword = __rest(verifiedUser, ["password"]);
        res.status(200).json({
            userWithoutPassword,
            msg: `Usuario ${verifiedUser.username} verificado`,
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
            return res.status(404).json({ msg: 'Usuario no encontrado', error: true, data: [] });
        const verifiedToken = jsonwebtoken_1.default.sign(email, `${process.env.SECRETKEY}`, {});
        const { id } = registeredUser;
        const verifiedUser = yield prisma.user.update({
            where: { id },
            data: {
                verifiedToken
            }
        });
        const fromEmail = (yield prisma.param.findUnique({ where: { key: 'zimbra_user' } })) || '';
        const htmlEmail = (yield prisma.param.findUnique({ where: { key: 'SIGNUP_HTML_EMAIL' } })) || '';
        const titleEmail = (yield prisma.param.findUnique({ where: { key: 'SIGNUP_TITLE_EMAIL' } })) || '';
        const htmlEmailReplaced = htmlEmail.value.replace(/\${process\.env\.BASE_URL}/g, process.env.BASE_URL).replace(/\${verifiedToken}/g, verifiedToken);
        if (fromEmail && email && htmlEmailReplaced && titleEmail)
            (0, mail_1.sendEmail)(fromEmail.value || '', email, '', htmlEmailReplaced, titleEmail.value, 'Info');
        return res.json({
            msg: `Correo de verificación enviado correctamente`,
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