import {Router} from "express";
import { registerHandler,loginUser,logoutHandler } from "../controller/User.controller.js";
import {upload} from '../middlewares/multer.middlewares.js'
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router=Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount:1
        },
        {
            name: "coverImage",
            maxCount:1
        },

    ]),
    registerHandler)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,logoutHandler)

export default router;