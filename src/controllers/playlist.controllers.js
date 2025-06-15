import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Video } from "../models/video.models.js"
import { Playlist } from "../models/playlist.models.js";



const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    if (
        [name, description].some((field) => field.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }


    try {
        const playlist = await Playlist.create({
            name,
            description,
            videos: [],
            owner: req.user._id
        })

        res.status(201).json(new ApiResponse(
            201,
            playlist,
            "Playlist created"
        ))

    } catch (error) {
        console.log("Error in creating playlist");
        throw new ApiError(400, "Error in creating playlist")
    }

})


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(500, "Enter valid Id")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "No such playlist exist")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "You cant add video in this playlist")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "No such video exist")
    }

    if (playlist.videos.includes(video._id)) {
        throw new ApiError(400, "Video already exists in the playlist");
    }

    playlist.videos.push(video)
    await playlist.save()

    res.status(200).json(new ApiResponse(
        200,
        {},
        "video added to playlist"
    ))

})


const getUserPlaylist = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Please prvide valid Id")
    }

    // const playlists = await Playlist.find({
    //     owner: userId
    // })

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerInfo"
            }
        },
        {
            $unwind: "$ownerInfo"
        },
        {
            $project: {
                name: 1,
                description: 1,
                videos: 1,
                createdAt: 1,
                updatedAt: 1,
                owner: "$ownerInfo._id",
                username: "$ownerInfo.username"
            }
        }
    ]);

    res.status(200).json(new ApiResponse(
        200,
        playlists,
        "All the playlist of the user"
    ))

})


const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Please provide valid Id")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(400, "No such playlist exist")
    }

    res.status(200).json(new ApiResponse(
        200,
        playlist,
        "Your playlist"
    ))

})


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Please provide correct playlist and video id")
    }

    const playlist = await Playlist.findById(playlistId)

    const initialLength = playlist.videos.length;

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "You are not authorized to delete video from this playlist")
    }

    playlist.videos = playlist.videos.filter(
        (vid) => vid.toString() !== videoId
    )

    if (playlist.videos.length === initialLength) {
        throw new ApiError(400, "Video not found in playlist");
    }

    await playlist.save()

    res.status(200).json(new ApiResponse(
        200,
        playlist,
        "Video removed from playlist"
    ))

})


const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Please provide valid id")
    }

    let playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "You are not authorized to delete video from this playlist")
    }

    let deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if (!deletedPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(new ApiResponse(
        200,
        {},
        "Playlist Deleted"
    ))

})


const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Please enter valid id")
    }

    if (
        [name, description].some((field) => field.trim() === "")
    ) {
        throw new ApiError(400, "All field are required")
    }

    let playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "You are not authorized to delete video from this playlist")
    }

    playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name: name,
                description: description
            }
        },
        { new: true }
    )

    res.status(200).json(new ApiResponse(
        200,
        playlist,
        "Updated playlist"
    ))

})


export {
    createPlaylist,
    addVideoToPlaylist,
    getUserPlaylist,
    getPlaylistById,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}