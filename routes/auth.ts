import { Router } from "express";
import { login, resendVerificationEmail, resetPassword, signUp, verifyAccount } from "../controller/auth";
import { getUserByUsername } from "../controller/user";
import { check} from "express-validator";
import { validateFields } from "../middlewares/validate-fields";
import { validateAuthStatus } from "../middlewares/validate-jwt";
const router = Router();

router.post('/login', 
    [
        check('username', 'Username is required').not().isEmpty(),
        check('password', 'Password is required').not().isEmpty(),
        validateFields as ()=>void
    ],
    login as any);
    
router.post('/forgotPassword',
    [
        check('username', 'Username is required').not().isEmpty(), 
        validateFields as ()=>void
    ],
    getUserByUsername
);
router.get('/checkAuthStatus',
    validateAuthStatus,
)

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
        validateFields as ()=>void
    ],
    resetPassword as any
)

router.post('/signUp',
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty(),
    check('email', 'Email is required').not().isEmpty(),
    check('profileId', 'ProfileId is required').not().isEmpty(),
    validateFields as ()=>void,
    signUp as any
)
router.get('/verifyAccount/:verifiedToken', verifyAccount as any);

router.post('/resendVerificationEmail', 
    check('email', 'Email is required').not().isEmpty(),
    validateFields as ()=>void,
    resendVerificationEmail as any);

export default router;
