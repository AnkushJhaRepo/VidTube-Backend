import { Router } from "express";
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet
} from "../controllers/tweet.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const router = Router()


router.route("/create").post(verifyJWT, createTweet)
router.route("/all-tweets").get(verifyJWT, getUserTweets)
router.route("/u/:tweetId").patch(verifyJWT, updateTweet)
router.route("/d/:tweetId").delete(verifyJWT, deleteTweet)

export default router