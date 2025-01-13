import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { transporter } from "../helpers/mailer";

export const sendEmail = async (
    from: string,
    to: string,
    text: string,
    html: string,
    subject: string,
    typeEmail: string
  ) => {
    try {
        const mailTransporter = await transporter();
        const result = await mailTransporter.sendMail({
            from,
            to,
            subject,
            text,
            html,
        });
        console.debug({
            error: false,
            msg: "Email sent successfully",
            data: result,
        });
    }catch (error) {
        console.warn(error);
    }
  }