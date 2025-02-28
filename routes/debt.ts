import { Router } from "express";
import {getAllDebtsByFilters, getDebtById, saveDebt} from "../controller/debt";
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
router.post('/', 
    [
        check('customerId', 'customerId is required').not().isEmpty(),
        check('titleName', 'titleName is required').not().isEmpty(),
        check('shopperName', 'shopperName is required').not().isEmpty(),
        check('localCode', 'localCode is required').not().isEmpty(),
        check('plotId', 'plotId is required').not().isEmpty(),
        check('actionLiquidationType', 'actionLiquidationType is required').not().isEmpty(),
        check('liquidationState', 'liquidationState is required').not().isEmpty(),
        check('year', 'year is required').not().isEmpty(),
        validateFields
    ],
    validateJWT,
    saveDebt);

export default router;