import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Like } from "../models/like.models.js"
import { Video } from "../models/video.models.js"
import { Tweet } from "../models/tweet.models.js";
import { Comment } from "../models/comment.models.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
    //console.log("📥 Incoming like toggle request");

    try {
        const { videoId } = req.params;
        //console.log("➡️ videoId:", videoId);

        if (!isValidObjectId(videoId)) {
            console.error("❌ Invalid video ID");
            throw new Error("Invalid video ID");
        }

        const userId = req.user?._id;
        //console.log("👤 User ID:", userId);

        const video = await Video.findById(videoId);
        if (!video) {
            console.error("❌ Video not found");
            throw new Error("Video not found");
        }

        //console.log("🔍 Checking existing like");
        const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

        let liked;
        if (existingLike) {
            //console.log("💔 Unliking...");
            await Like.findByIdAndDelete(existingLike._id);
            liked = false;

        } else {
            //console.log("❤️ Liking...");
            await Like.create({ video: videoId, likedBy: userId });
            liked = true;
        }

        const likesCount = await Like.countDocuments({ video: videoId });

        await Video.findByIdAndUpdate(videoId, { likesCount });

        //console.log("✅ Like count:", likesCount);

        return res.status(200).json({
            success: true,
            data: { liked, likesCount },
            message: liked ? "Video liked" : "Video unliked"
        });

    } catch (err) {
        console.error("🔥 ERROR in toggleVideoLike:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
});


const videoDetails = asyncHandler(async (req, res) => {
    //console.log("HELLO I HAVE BEEN HIT");
    
    try {
        const { videoId } = req.params
        const userId = req.user?._id
        const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

        let liked

        if (existingLike) {
            //console.log("💔 Unliking...");
            liked = false;
        } else {
            //console.log("❤️ Liking...");
            liked = true;
        }

        const likesCount = await Like.countDocuments({ video: videoId });

        return res.status(200).json(new ApiResponse(
            200,
            {liked, likesCount},
            "Video details"
        ))

    } catch (error) {
        console.error("ERROR in VideoDetails:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
})


const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(500, "Error in id")
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "No such tweet exist")
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)

        res.status(200).json(new ApiResponse(
            200,
            {},
            "Tweet disliked"
        ))
    } else {
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
    const { commentId } = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(500, "Invalid id")
    }

    const comment = Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "No comment found")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)

        res.status(200).json(new ApiResponse(
            200,
            {},
            "Comment disliked"
        ))
    } else {
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
        video: { $exists: true }
    })

    const videoIds = likedVideoId.map(like => like.video)

    const videos = await Video.find({
        _id: { $in: videoIds }
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
    getLikedVideos,
    videoDetails
}