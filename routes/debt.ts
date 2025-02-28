import { Router } from "express";
import {getAllDebtsByFilters, getDebtById} from "../controller/debt";
import { validateJWT } from "../middlewares/validate-jwt";
import { check } from "express-validator";
import { validateFields } from "../middlewares/validate-fields";
const router = Router();

router.get('/', 
    validateJWT,
    getAllDebtsByFilters);
router.get('/:id',
    validateJWT,
    getDebtById);

export default router;