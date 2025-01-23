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
exports.createCheckout = void 0;
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const querystring_1 = __importDefault(require("querystring"));
const prisma = new client_1.PrismaClient();
const createCheckout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const path = '/v1/checkouts';
    const query = querystring_1.default.stringify({
        entityId: '8ac7a4c9946d09a101946f4ce97804f1',
        amount: '1.00',
        currency: 'USD',
        paymentType: 'DB'
    });
    const url = `${process.env.DATAFAST_URL}${process.env.DATAFAST_URL_PATH}?${query}`;
    try {
        const { data } = yield axios_1.default.post(url, {}, {
            headers: {
                'Authorization': 'Bearer OGE4Mjk0MTg1YTY1YmY1ZTAxNWE2YzhjNzI4YzBkOTV8YmZxR3F3UTMyWA=='
            }
        });
        console.log({ data });
        return res.json({
            msg: 'ok',
            error: false,
            data
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            msg: 'Error al crear el checkout',
            error
        });
    }
});
exports.createCheckout = createCheckout;
//# sourceMappingURL=paymentButton.js.map