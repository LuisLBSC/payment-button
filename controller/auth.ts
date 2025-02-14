import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { generateJWT } from "../helpers/generate-jwt";
import { encryptPassword, validatePassword } from "../helpers/password";
import { sendEmail } from "./mail";
import jwt from "jsonwebtoken";
import { profile } from "console";
import { setDefaultAutoSelectFamily } from "net";

const prisma = new PrismaClient();
export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        let generatedToken;
        let validPassword = false;
        if (!username || !password) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        const existingUser = await prisma.user.findFirst({
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
                msg: 'User not found',
                error: true,
                data: []
            });
        }

        const entityMap = new Map();
        const userProfile = existingUser?.profile;

        if (!userProfile) {
            return res.status(400).json({
                msg: 'User without assigned profile',
                error: true,
                data: []
            });
        }

        if (!existingUser.verified) {
            return res.status(403).json({
                msg: 'User not verified',
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
        }


        validPassword = await validatePassword(password, existingUser.password);
        if (!validPassword) {
            const fromEmail = await prisma.param.findUnique({ where: { key: 'zimbra_user' } }) || '';
            const defaultEmails = await prisma.param.findUnique({ where: { key: 'DEFAULT_EMAILS' } });
            const titleEmail = await prisma.param.findUnique({ where: { key: 'LOGIN_ERROR_TITLE_EMAIL' } }) || '';
            const logintHtmlEmail = await prisma.param.findUnique({ where: { key: 'LOGIN_ERROR_HTML_EMAIL' } });
            if (fromEmail && defaultEmails && logintHtmlEmail && titleEmail)
                sendEmail(fromEmail.value || '', existingUser.email, '', logintHtmlEmail.value, titleEmail.value, 'Info');
            else {
                return res.status(400).json({ msg: 'Invalid Password and missing required parameters for email configuration', error: false, data: [] });
            }

            return res.status(401).json({ msg: 'Invalid Password', error: false, data: [] });
        }


        generatedToken = await generateJWT(userWithEntities.id);
        return res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: userWithEntities,
            token: generatedToken || ''
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error: error,
            data: []

        });
    }
}

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { id, password, confirmPassword } = req.body;
        if (!(id || password || confirmPassword)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        const existingUser = await prisma.user.findFirst({ where: { id, active: 1 } });

        if (!existingUser) {
            return res.status(404).json({ msg: 'User not found', error: true, data: [] });
        }

        const matchPasswords = await validatePassword(password, existingUser.password);
        if (matchPasswords) {
            return res.status(400).json({ msg: 'New password cannot be the same as the old one', error: true, data: [] });
        }

        const encryptedPassword = await encryptPassword(password);

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                password: encryptedPassword
            }
        });

        res.json({
            msg: `Username: ${updatedUser.username} -> Password changed successfully`,
            error: false
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error: error,
            data: []

        });
    }
}

export const signUp = async (req: Request, res: Response) => {
    try {
        console.log(req.body);
        const {
            username,
            password,
            email,
            name,
            middlename,
            lastname,
            phone,
            address,
            country,
            postCode,
            profileId
        } = req.body;
        if (!username || !password) return res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        const existingUser = await prisma.user.findFirst({ where: { username: username, active: 1 } });

        if (existingUser) return res.status(409).json({ msg: 'User already exists', error: true, data: [] });

        const encryptedPassword = await encryptPassword(password);

        const verifiedToken = jwt.sign(email, `${process.env.SECRETKEY}`, {});

        const newUser = await prisma.user.create({
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
                profileId
            }
        });

        const fromEmail = await prisma.param.findUnique({ where: { key: 'zimbra_user' } }) || '';
        const titleEmail = await prisma.param.findUnique({ where: { key: 'SIGNUP_TITLE_EMAIL' } }) || '';
        const htmlEmail = await prisma.param.findUnique({ where: { key: 'SIGNUP_HTML_EMAIL' } }) || '';
        const htmlEmailReplaced = htmlEmail.value.replace(
            /\${process\.env\.BASE_URL}/g,
            process.env.BASE_URL
        ).replace(
            /\${verifiedToken}/g,
            verifiedToken
        );
        if (fromEmail && newUser.email && htmlEmailReplaced && titleEmail)
            sendEmail(fromEmail.value || '', newUser.email, '', htmlEmailReplaced, titleEmail.value, 'Info');

        return res.json({
            msg: `Username: ${newUser.username} registed`,
            error: false,
            records: 1,
            data: newUser
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error: error,
            data: []

        });
    }
}

export const verifyAccount = async (req: Request, res: Response) => {
    try {
        const { verifiedToken } = req.params;
        if (!verifiedToken) return res.status(400).json({ msg: 'An error occurred while verifying account', error: true, records: 0, data: [] });

        const validateToken = jwt.verify(verifiedToken, process.env.SECRETKEY || '');
        if (!validateToken) return res.status(400).json({ msg: 'Invalid token', error: true, records: 0, data: [] });

        const registeredUser = await prisma.user.findUnique({ where: { email: validateToken } });

        if (!registeredUser) return res.status(404).json({ msg: 'User not found', error: true, data: [] });

        const { id } = registeredUser;
        const verifiedUser = await prisma.user.update({
            where: { id },
            data: {
                verified: 1,
                verifiedToken: null
            }
        });

        res.status(200).json({
            verifiedUser,
            msg: `User ${verifiedUser.username} verified`,
            error: false,
            records: 1
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error: error,
            data: []

        });
    }
}


export const resendVerificationEmail = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const registeredUser = await prisma.user.findUnique({ where: { email } });

        if (!registeredUser) return res.status(404).json({ msg: 'User not found', error: true, data: [] });

        const verifiedToken = jwt.sign(email, `${process.env.SECRETKEY}`, {});
        const { id } = registeredUser;
        const verifiedUser = await prisma.user.update({
            where: { id },
            data: {
                verifiedToken
            }
        });
        const fromEmail = await prisma.param.findUnique({ where: { key: 'zimbra_user' } }) || '';
        const htmlEmail = await prisma.param.findUnique({ where: { key: 'SIGNUP_HTML_EMAIL' } }) || '';
        const titleEmail = await prisma.param.findUnique({ where: { key: 'SIGNUP_TITLE_EMAIL' } }) || '';
        const htmlEmailReplaced = htmlEmail.value.replace(
            /\${process\.env\.BASE_URL}/g,
            process.env.BASE_URL
        ).replace(
            /\${verifiedToken}/g,
            verifiedToken
        );
        if (fromEmail && email && htmlEmailReplaced && titleEmail)
            sendEmail(fromEmail.value || '', email, '', htmlEmailReplaced, titleEmail.value, 'Info');

        return res.json({
            msg: `Verification email sent successfully`,
            error: false
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error: error,
            data: []

        });
    }
}