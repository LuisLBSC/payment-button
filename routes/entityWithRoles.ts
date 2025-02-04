import { Router } from "express";
import { getEntitiesWithRoles, saveEntitiesWithRoles } from "../controller/entityWithRoles";
import { validateJWT } from "../middlewares/validate-jwt";
const router = Router();

router.get('/', 
    validateJWT,
    getEntitiesWithRoles);
router.post('/',
    validateJWT,
    saveEntitiesWithRoles);

export default router;