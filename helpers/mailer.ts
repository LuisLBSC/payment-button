import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);

oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
});

async function getAccessToken() {
    try {
        const { token } = await oauth2Client.getAccessToken();
        return token;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const transporter = async () => {
    //const accessToken = await getAccessToken();
    const requestParams = await prisma.param.findMany({
        where: {
            key: {
                startsWith: 'zimbra_',
            },
        },
    });

    const paramsMap: { [key: string]: string | undefined } = requestParams.reduce((acc, param) => {
        const key = param.key.replace('zimbra_', '');
        acc[key] = param.value;
        return acc;
    }, {} as { [key: string]: string | undefined });

    const { host, port, user, password } = paramsMap;
    const missingParams: string[] = [];

    if (!host) missingParams.push('host');
    if (!port) missingParams.push('port');
    if (!user) missingParams.push('user');
    if (!password) missingParams.push('password');

    if (missingParams.length > 0) {
        throw new Error(`Faltan parámetros de configuración requeridos: ${missingParams.join(', ')}`);
    }

    return nodemailer.createTransport({
        host: host,
        port: port,
        secure: true,
        auth: {
            user: user,
            pass: password
        },
        tls: {
            rejectUnauthorized: true
        }
    });
};
