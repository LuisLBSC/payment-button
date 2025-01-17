import { Router } from "express";
import {getAllDebtsByUser, getDebtById} from "../controller/debt";
import { validateJWT } from "../middlewares/validate-jwt";
const router = Router();

router.get('/', getAllDebtsByUser);
router.get('/:id',
    validateJWT,
    getDebtById);

export default router;