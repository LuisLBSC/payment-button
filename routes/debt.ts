import { Router } from "express";
import {getAllDebtsByUser, getDebtById, saveDebt} from "../controller/debt";
import { validateJWT } from "../middlewares/validate-jwt";
import { check } from "express-validator";
import { validateFields } from "../middlewares/validate-fields";
const router = Router();

router.get('/', 
    validateJWT,
    getAllDebtsByUser);
router.get('/:id',
    validateJWT,
    getDebtById);
router.post('/', 
    [
        check('customerId', 'Name is required').not().isEmpty(),
        check('titleName', 'Name is required').not().isEmpty(),
        check('shopperName', 'Name is required').not().isEmpty(),
        check('localCode', 'Name is required').not().isEmpty(),
        check('plotId', 'Name is required').not().isEmpty(),
        check('actionLiquidationType', 'Name is required').not().isEmpty(),
        check('liquidationState', 'Name is required').not().isEmpty(),
        check('year', 'Name is required').not().isEmpty(),
        validateFields
    ],
    validateJWT,
    saveDebt);

export default router;