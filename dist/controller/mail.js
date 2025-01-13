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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const mailer_1 = require("../helpers/mailer");
const sendEmail = (from, to, text, html, subject, typeEmail) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mailTransporter = yield (0, mailer_1.transporter)();
        const result = yield mailTransporter.sendMail({
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
    }
    catch (error) {
        console.warn(error);
    }
});
exports.sendEmail = sendEmail;
//# sourceMappingURL=mail.js.map