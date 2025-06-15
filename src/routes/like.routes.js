import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import { 
    getLikedVideos,
    toggleCommentLike,
    toggleTweetLike, 
    toggleVideoLike } from "../controllers/like.controllers.js";

const router = Router()


router.route("/video-like/:videoId").get(verifyJWT, toggleVideoLike)
router.route("/tweet-like/:tweetId").get(verifyJWT, toggleTweetLike)
router.route("/comment-like/:commentId").get(verifyJWT, toggleCommentLike)
router.route("/all-liked").get(verifyJWT, getLikedVideos)

export default router