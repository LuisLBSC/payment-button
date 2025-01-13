import { Router } from "express";
import {getAllRoles, getRoleById, saveRole, updateRoleById, deleteRoleById} from "../controller/role";
import { validateJWT } from "../middlewares/validate-jwt";
import { check} from "express-validator";
import { validateFields } from "../middlewares/validate-fields";
const router = Router();

router.get('/', getAllRoles);
router.get('/:id',
    validateJWT,
    getRoleById);
router.post('/', 
    [
        check('name', 'Name is required').not().isEmpty(),
        validateFields
    ],
    validateJWT,
    saveRole);
router.put('/:id', 
    [
        check('name', 'Name is required').not().isEmpty(),
        validateFields
    ],
    validateJWT,
    updateRoleById);
router.delete('/:id', 
    validateJWT,
    deleteRoleById);

export default router;