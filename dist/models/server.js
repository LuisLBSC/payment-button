"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("../routes/user"));
const role_1 = __importDefault(require("../routes/role"));
const profile_1 = __importDefault(require("../routes/profile"));
const auth_1 = __importDefault(require("../routes/auth"));
const param_1 = __importDefault(require("../routes/param"));
const debt_1 = __importDefault(require("../routes/debt"));
const payment_1 = __importDefault(require("../routes/payment"));
const payment_2 = __importDefault(require("../routes/payment"));
const paymentButton_1 = __importDefault(require("../routes/paymentButton"));
const cors_1 = __importDefault(require("cors"));
class Server {
    constructor() {
        this.apiPaths = {
            users: '/api/users',
            roles: '/api/roles',
            profiles: '/api/profiles',
            debt: '/api/debt',
            auth: '/api/auth',
            params: '/api/params',
            payment: '/api/payment',
            entities: '/api/entity',
            paymentButton: '/api/paymentButton'
        };
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || '3000';
        this.middlewares();
        this.routes();
    }
    middlewares() {
        //add this line for cors
        this.app.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "auth-token, Content-Type");
            next();
        });
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.static('public'));
    }
    routes() {
        this.app.use(this.apiPaths.users, user_1.default);
        this.app.use(this.apiPaths.roles, role_1.default);
        this.app.use(this.apiPaths.profiles, profile_1.default);
        this.app.use(this.apiPaths.auth, auth_1.default);
        this.app.use(this.apiPaths.params, param_1.default);
        this.app.use(this.apiPaths.debt, debt_1.default);
        this.app.use(this.apiPaths.payment, payment_1.default);
        this.app.use(this.apiPaths.entities, payment_2.default);
        this.app.use(this.apiPaths.paymentButton, paymentButton_1.default);
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log('Server iniciado: ' + this.port);
        });
    }
}
exports.default = Server;
//# sourceMappingURL=server.js.map