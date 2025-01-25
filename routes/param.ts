import { Router } from "express";
import { getAllParams, getParamById, getParamByKey, saveParam, updateParamById, updateParamByKey, 
    deleteParamById, deleteParamByKey, getRequestParams, saveOrUpdateParams } from "../controller/param";
import { check} from "express-validator";
import { validateFields } from "../middlewares/validate-fields";
import { validateJWT } from "../middlewares/validate-jwt";
const router = Router();

router.get('/', 
    validateJWT,
    getAllParams);
router.get('/request', 
    validateJWT,
    getRequestParams);
router.get('/:id',
    validateJWT,
    getParamById);
router.get('/getByKey/:key',
    validateJWT,
    getParamByKey);

router.post('/',
    [
        check('key', 'Key is required').not().isEmpty(),
        check('value', 'Value is required').not().isEmpty(),
        validateFields
    ],
    validateJWT,
    saveParam);

router.put('/saveReqs',
    validateJWT,
    saveOrUpdateParams);
router.put('/:id',
    [
        check('key', 'Key is required').not().isEmpty(),
        check('value', 'Value is required').not().isEmpty(),
        validateFields
    ],
    validateJWT,
    updateParamById);
router.put('/updateByKey/:key',
    [
        check('key', 'Key is required').not().isEmpty(),
        check('value', 'Value is required').not().isEmpty(),
        validateFields
    ],
    validateJWT,
    updateParamByKey);

router.delete('/:id', 
    validateJWT,
    deleteParamById);

router.delete('/deleteByKey/:key', 
    validateJWT,
    deleteParamByKey);

export default router;