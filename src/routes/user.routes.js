import {Router} from "express";
import { registerHandler } from "../controller/User.controller.js";
const router=Router()

router.route("/register").post(registerHandler)

export default router;