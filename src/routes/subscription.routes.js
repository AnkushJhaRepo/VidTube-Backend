import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription
} from "../controllers/subscription.controllers.js";

const router = Router()


router.route("/subscribe/:channelId").patch(verifyJWT, toggleSubscription)
router.route("/get-subscribers").get(verifyJWT, getUserChannelSubscribers)
router.route("/get-subscriptions").get(verifyJWT, getSubscribedChannels)


export default router
