import { Router } from "express";
import {  getAllUsers, getUserById, saveUser, updateUserById, deleteUserById} from "../controller/user";
import { validateJWT } from "../middlewares/validate-jwt";
import { check} from "express-validator";
import { validateFields } from "../middlewares/validate-fields";
const router = Router();

router.get('/', 
    validateJWT,
    getAllUsers);
router.get('/:id', 
    validateJWT,
    getUserById);
router.post('/',
    [
        check('username', 'Username is required').not().isEmpty(),
        check('password', 'Password is required').not().isEmpty(),
        check('email', 'Email is required').not().isEmpty(),
        check('email', 'Invalid email').isEmail(),
        check('profileId', 'Profile id is required').not().isEmpty(),
        validateFields
    ],
    validateJWT,
    saveUser);
router.put('/:id', 
    [
        check('username', 'Username is required').not().isEmpty(),
        check('password', 'Password is required').not().isEmpty(),
        check('email', 'Email is required').not().isEmpty(),
        check('email', 'Invalid email').isEmail(),
        check('profileId', 'Profile id is required').not().isEmpty(),
        validateFields
    ],
    validateJWT,
    updateUserById);
router.delete('/:id', 
    validateJWT,
    deleteUserById);

export default router;