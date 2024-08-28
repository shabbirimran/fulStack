import {Router} from "express";
import { registerHandler,loginUser,logoutHandler,refreshAccessToken, changeCurrentPassword } from "../controller/User.controller.js";
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
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
export default router;