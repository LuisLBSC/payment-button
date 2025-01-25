import { Router } from "express";
import { getAllEntities, getEntityById, getEntityByName, saveEntity, updateEntityById, updateEntityByName, 
    deleteEntityById, deleteEntityByName} from "../controller/entity";
import { check} from "express-validator";
import { validateFields } from "../middlewares/validate-fields";
import { validateJWT } from "../middlewares/validate-jwt";
const router = Router();

router.get('/', 
    validateJWT,
    getAllEntities);
router.get('/:id',
    validateJWT,
    getEntityById);
router.get('/getByName/:name',
    validateJWT,
    getEntityByName);

router.post('/',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('description', 'Name is required').not().isEmpty(),
        validateFields
    ],
    validateJWT,
    saveEntity);
    
router.put('/:id',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('description', 'Name is required').not().isEmpty(),
        validateFields
    ],
    validateJWT,
    updateEntityById);
router.put('/updateByName/:name',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('description', 'Name is required').not().isEmpty(),
        validateFields
    ],
    validateJWT,
    updateEntityByName);

router.delete('/:id', 
    validateJWT,
    deleteEntityById);

router.delete('/deleteByName/:name', 
    validateJWT,
    deleteEntityByName);

export default router;