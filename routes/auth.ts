import { Router } from "express";
import { login, resetPassword } from "../controller/auth";
import { getUserByUsername } from "../controller/user";
import { check} from "express-validator";
import { validateFields } from "../middlewares/validate-fields";
const router = Router();

router.post('/login', 
    [
        check('username', 'Username is required').not().isEmpty(),
        check('password', 'Password is required').not().isEmpty(),
        validateFields
    ],
    login);
router.post('/forgotPassword',
    [
        check('username', 'Username is required').not().isEmpty(), 
        validateFields
    ],
    getUserByUsername
);
router.post('/resetPassword',
    [
        check('id', 'Id es required').not().isEmpty(),
        check('password', 'Password is required').not().isEmpty(),
        check('confirmPassword', 'Confirm Password is required').not().isEmpty(),
        check('confirmPassword').custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error("Passwords don't match");
            }
            return true; 
        }),
        validateFields
    ],
    resetPassword
)

export default router;
