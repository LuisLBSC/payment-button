import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { generateJWT } from "../helpers/generate-jwt";
import { encryptPassword, validatePassword } from "../helpers/password";
import { sendEmail } from "./mail";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
export const login = async(req: Request, res: Response) => {
    try {
        const {username, password} = req.body;
        let generatedToken;
        let validPassword = false;
        if (!username || !password) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        
        const existingUser = await prisma.user.findFirst({where: {username: username, active: 1}});
        
        if (!existingUser){
            return res.status(404).json({ 
                msg: 'User not found', 
                error: true, 
                data: [] 
            });
        }
        
        validPassword = await validatePassword(password, existingUser.password);
        if(!validPassword){
            const defaultEmails = await prisma.param.findUnique({where: { key: 'DEFAULT_EMAILS' }}) || '';
            const defaultTextEmail = await prisma.param.findUnique({where: { key: 'DEFAULT_TEXT_EMAIL' }});
            const defaultHtmlEmail = await prisma.param.findUnique({where: { key: 'DEFAULT_HTML_EMAIL' }});
            if(!defaultEmails)
                sendEmail(process.env.EMAIL || '', defaultEmails?.value, defaultTextEmail.value, defaultHtmlEmail?.value, 'Login Failed!','Info');
            
            return res.status(404).json({msg: 'Invalid Password', error: false, data:log});
        }
            
        
        generatedToken = await generateJWT(existingUser.id);
        return res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: existingUser,
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

export const resetPassword = async(req: Request, res: Response) => {
    try {
        const {id, password, confirmPassword} = req.body;
        if (!(id || password || confirmPassword)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        const existingUser = await prisma.user.findFirst({where: {id, active: 1}});

        if (!existingUser){
            return res.status(404).json({ msg: 'User not found', error: true, data: [] });   
        }

        const matchPasswords = await validatePassword(password, existingUser.password);
        if(matchPasswords){
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

export const signUp = async(req: Request, res: Response) => {
    try {
        const {username, password, email, 
            name, 
            middleName,
            lastname,
            phone,
            address,
            country,
            postCode, profileId} = req.body;
        if (!username || !password) return res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });
        
        const existingUser = await prisma.user.findFirst({where: {username: username, active: 1}});

        if (existingUser) return res.status(400).json({ msg: 'User already exists', error: true, data: [] });

        const encryptedPassword = await encryptPassword(password);
        
        const verifiedToken = jwt.sign(email, `${process.env.SECRETKEY}`, {});

        const newUser = await prisma.user.create({
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

        const htmlEmail = await prisma.param.findUnique({where: { key: 'SIGNUP_HTML_EMAIL' }}) || '';
        const htmlEmailReplaced = htmlEmail.value.replace(
            /\${process\.env\.BASE_URL}/g,
            process.env.BASE_URL
          ).replace(
            /\${verifiedToken}/g,
            verifiedToken
          );
        if(newUser.email && htmlEmailReplaced)
            sendEmail(process.env.EMAIL || '', newUser.email, '', htmlEmailReplaced, 'Verificar usuario', 'Info');

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

export const verifyAccount = async(req: Request, res: Response) => {
    try {
        const {verifiedToken} = req.params;
        if (!verifiedToken) return res.status(400).json({ msg: 'An error occurred while verifying account', error: true, records: 0, data: [] });

        const validateToken = jwt.verify(verifiedToken, process.env.SECRETKEY || '');
        if (!validateToken) return res.status(400).json({ msg: 'Invalid token', error: true, records: 0, data: [] });

        const registeredUser = await prisma.user.findUnique({where: {email: validateToken}});

        if(!registeredUser) return res.status(404).json({ msg: 'User not found', error: true, data: [] });

        const {id} = registeredUser;
        const verifiedUser = await prisma.user.update({
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
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error: error,
            data: []

        });
    }
}


export const resendVerificationEmail = async(req: Request, res: Response) => {
    try {
        const {email} = req.body;
        const registeredUser = await prisma.user.findUnique({where: {email}});

        if(!registeredUser) return res.status(404).json({ msg: 'User not found', error: true, data: [] });

        const verifiedToken = jwt.sign(email, `${process.env.SECRETKEY}`, {});
        const {id} = registeredUser;
        const verifiedUser = await prisma.user.update({
            where: { id },
            data: {
                verifiedToken
            }
        });
        const htmlEmail = await prisma.param.findUnique({where: { key: 'SIGNUP_HTML_EMAIL' }}) || '';
        const htmlEmailReplaced = htmlEmail.value.replace(
            /\${process\.env\.BASE_URL}/g,
            process.env.BASE_URL
          ).replace(
            /\${verifiedToken}/g,
            verifiedToken
          );
        if(email && htmlEmailReplaced)
            sendEmail(process.env.EMAIL || '', email, '', htmlEmailReplaced, 'Verificar usuario', 'Info');

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