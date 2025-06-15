import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middlewares.js"
import { 
    addComment, 
    deleteComment, 
    getVideoComment, 
    updateComment
} from "../controllers/comment.controllers.js";

const router = Router()


router.route("/add-comment-video/:videoId").post(verifyJWT, addComment)
router.route("/update-comment/:commentId").patch(verifyJWT,updateComment)
router.route("/delete-comment/:commentId").delete(verifyJWT, deleteComment)
router.route("/all-comment/:videoId").get(getVideoComment)


export default router