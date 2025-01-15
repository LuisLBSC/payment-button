import { Router } from "express";
import {getAllProfiles, getProfileById, saveProfile, updateProfileById, deleteProfileById} from "../controller/profile";
import { validateJWT } from "../middlewares/validate-jwt";
import { check } from "express-validator";
import { validateFields } from "../middlewares/validate-fields";

const router = Router();

router.get('/', getAllProfiles);
router.get('/:id', 
    validateJWT,
    getProfileById);
router.post('/', 
    [
        check('name', 'Name is required').not().isEmpty(),
        validateFields
    ],
    validateJWT,
    saveProfile);
router.put('/:id', 
    [
        check('name', 'Name is required').not().isEmpty(),
        validateFields
    ],
    validateJWT,
    updateProfileById);
router.delete('/:id', 
    validateJWT,
    deleteProfileById);

export default router;