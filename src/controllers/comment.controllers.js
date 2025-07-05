import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.models.js"


const addComment = asyncHandler(async (req, res) => {

    //console.log("I have been hit")

    const { videoId } = req.params
    //console.log(`videoId is ${videoId}`);
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(500, "The video id is wrong")
    }


    const { content } = req.body
    //console.log("content",content);
    
    if (content.trim() === "") {
        throw new ApiError(400, "All fields are required")
    }

    const video = await Video.findById(videoId)
    //console.log(`video is ${video}`);
    
    if (!video) {
        throw new ApiError(404, "No such video exist")
    }


    try {
        const comment = await Comment.create({
            video: video._id,
            content: content,
            owner: req.user._id
        })

        //console.log("Commented successfully");
        

        res.status(201).json(new ApiResponse(
            201,
            comment,
            "Commented successfully"
        ))
    } catch (error) {
        console.log("Something went wrong while creating comment");
        throw new ApiError(400, "Something went wrong with creating comment")
    }

})


const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body
    if (!isValidObjectId(commentId)) {
        throw new ApiError(500, "Something is wrong with Id")
    }

    if (content.trim() === "") {
        throw new ApiError(400, "Require all the fields")
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content
            }
        },
        { new: true }
    )

    res.status(200).json(new ApiResponse(
        200,
        comment,
        "Updated Comment"
    ))

})


const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(500, "Please give correct id")
    }

    const comment = await Comment.findByIdAndDelete(commentId)
    if (!comment) {
        throw new ApiError(404, "No such comment found")
    }

    res.status(200).json(new ApiResponse(
        200,
        {},
        "Comment deleted"
    ))

})


const getVideoComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    const skip = (page - 1) * limit

    const comment = await Comment.find({
        video: videoId
    })
        .skip(skip)
        .limit(Number(limit))


    res.status(200).json(new ApiResponse(
        200,
        comment,
        "All the comments"
    ))

})


export {
    addComment,
    updateComment,
    deleteComment,
    getVideoComment
}