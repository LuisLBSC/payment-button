import { Router } from "express";
import { getAllTransactions } from "../controller/transaction";
import { validateJWT } from "../middlewares/validate-jwt";
const router = Router();

router.get('/', 
    validateJWT,
    getAllTransactions);