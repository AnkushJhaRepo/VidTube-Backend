import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Like } from "../models/like.models.js"
import { Video } from "../models/video.models.js"
import { Tweet } from "../models/tweet.models.js"; 
import { Comment } from "../models/comment.models.js"; 


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(500, "The video id is incorrect")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(new ApiResponse(
            200,
            {},
            "Video unliked"
        ))
    } else {
        await Like.create({
            video: videoId,
            likedBy: req.user._id
        })

        return res.status(201).json(new ApiResponse(
            201,
            {},
            "Video Liked"
        ))
    }

})


const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(500,"Error in id")
    }

    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404,"No such tweet exist")
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)

        res.status(200).json(new ApiResponse(
            200,
            {},
            "Tweet disliked"
        ))
    }else {
        await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })

        res.status(201).json(new ApiResponse(
            201,
            {},
            "Tweet liked"
        ))
    }

})


const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(500,"Invalid id")
    }

    const comment = Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404,"No comment found")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    if(existingLike) {
        await Like.findByIdAndDelete(existingLike._id)

        res.status(200).json(new ApiResponse(
            200,
            {},
            "Comment disliked"
        ))
    }else {
        await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })

        res.status(201).json(new ApiResponse(
            201,
            {},
            "Comment liked"
        ))
    }

})


const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideoId = await Like.find({
        likedBy: req.user._id,
        video: { $exists: true}
    })

    const videoIds = likedVideoId.map(like => like.video)

    const videos = await Video.find({
        _id: { $in: videoIds}
    })

    res.status(200).json(new ApiResponse(
        200,
        videos,
        "All liked videos"
    ))
})


export {
    toggleVideoLike,
    toggleTweetLike,
    toggleCommentLike,
    getLikedVideos
}