import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {loginUser} from"../controllers/login_user.controller.js";
import { logoutUser } from "../controllers/logout_user.controller.js"; 

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(logoutUser); 



export default router;