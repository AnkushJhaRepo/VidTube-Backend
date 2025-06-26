import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import { 
    getLikedVideos,
    toggleCommentLike,
    toggleTweetLike, 
    toggleVideoLike, 
    videoDetails} from "../controllers/like.controllers.js";

const router = Router()


router.route("/video-like/:videoId").post(verifyJWT, toggleVideoLike)
router.route("/video-details/:videoId").get(videoDetails)
router.route("/tweet-like/:tweetId").get(verifyJWT, toggleTweetLike)
router.route("/comment-like/:commentId").get(verifyJWT, toggleCommentLike)
router.route("/all-liked").get(verifyJWT, getLikedVideos)

export default router