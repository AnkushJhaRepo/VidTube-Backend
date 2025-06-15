import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(500, "Wrong channel id")
    }

    if (channelId === req.user._id) {
        throw new ApiError(400, "You cant subscribe to your own channel")
    }

    const isSubscribed = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    if (isSubscribed) {
        await Subscription.findByIdAndDelete(isSubscribed._id)

        res.status(200).json(new ApiResponse(
            200,
            {},
            "Channel unsubscribed"
        ))
    } else {
        await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })

        res.status(201).json(new ApiResponse(
            201,
            {},
            "Channel subscribed"
        ))
    }

})


const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const isSubscriberId = await Subscription.find({
        channel: req.user._id
    })

    const subscribersId = isSubscriberId.map(subscribe => subscribe.subscriber)

    const totalSubscribers = subscribersId.length

    const subscribers = await User.find({
        _id: { $in: subscribersId }
    }).select("username fullname")

    res.status(200).json(new ApiResponse(
        200,
        {
            totalSubscribers,
            subscribers,
        },
        "These are the list of subscribers"
    ))

})


const getSubscribedChannels = asyncHandler(async (req, res) => {
    const isSubscribedId = await Subscription.find({
        subscriber: req.user._id
    })

    const subscribedId = isSubscribedId.map(subscription => subscription.channel)

    const totalSubscription = subscribedId.length

    const subscription = await User.find({
        _id: {$in: subscribedId}
    }).select("username fullname")

    res.status(200).json(new ApiResponse(
        200,
        {
            totalSubscription,
            subscription
        },
        "Total channel user is subscribed to "
    ))

})


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}