import mongoose, { isValidObjectId} from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Tweet} from "../models/tweet.models.js"


const createTweet = asyncHandler(async (req, res) => {
    // if(!req.user._id){
    //     console.log("User not connected");
    //     throw new ApiError(500,"Cant tweet without logged in")
    // }

    const {content} = req.body
    if(content.trim() === ""){
        throw new ApiError(400,"cant create an empty tweet")
    }

    try {
        const tweet = await Tweet.create({
            owner: req.user._id,
            content: content
        })

        res.status(201).json(new ApiResponse(
        201,
        tweet,
        "tweet created successfully"
    ))
    } catch (error) {
        console.log("Error in creating the tweet");
        throw new ApiError(500,"Error in creating the tweet")
    }

})


const getUserTweets = asyncHandler(async (req, res) => {
    const tweet = await Tweet.find({owner : req.user._id})

    if(tweet.length === 0){
        throw new ApiError(400, "User has not done any tweets")
    }

    res.status(200).json(new ApiResponse(
        200,
        tweet,
        "All the tweet of the user"
    ))
})


const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(500, "Error in tweet id")
    }

    const { content } = req.body

    //idhar newTweet = content karke newTweet pai bhi kaam kar sakte hai

    if(content.trim() === ""){
        throw new ApiError(500,"Tweet cant be empty")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content: content
            }
        },
        { new:true }
    )

    res.status(200).json(new ApiResponse(
        200,
        tweet,
        "Tweet updated successfully"
    ))

})


const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(500, "The tweet id is incorrect")
    }

    if(!{owner: req.user._id}){
        throw new ApiError(500, "You are not eligible to delete this tweet")
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId)

    res.status(200).json(new ApiResponse(
        200,
        {},
        "tweet deleted successfully"
    ))
})


export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}