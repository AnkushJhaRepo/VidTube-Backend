import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.models.js"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import ffmpeg from "fluent-ffmpeg";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    const filter = {
        isPublished: true
    };

    if (query && query.trim()) {
        filter.title = { $regex: query, $options: "i" }; // case-insensitive title search
    }

    if (userId) {
        filter.owner = userId;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("owner", "username avatar")
        .exec();

    //console.log(videos);


    const total = await Video.countDocuments(filter);

    res.status(200).json(new ApiResponse(
        200,
        {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
            videos
        },
        "Videos fetched successfully"
    ));
})


const userAllVideo = asyncHandler(async (req, res) => {
    const { ownerId } = req.params

    if(!ownerId){
        throw new ApiError(400,"No video with this owner Id")
    }

    const filter = {
        owner: ownerId
    }

    const videos = await Video.find(filter)

    res.status(200).json(new ApiResponse(
        200,
        "All users video",
        videos
    ))


})


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    console.log("I have been hit");



    console.log(req.body)



    if (
        [title, description].some((field) => field.trim() === "")) {
        throw new ApiError(500, "All fields are required")
    }
    const videoLocalPath = req.files?.videoFile?.[0]?.path



    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    let durationFormatted;
    try {
        const durationInSeconds = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(videoLocalPath, (err, metadata) => {
                if (err) return reject(err);
                resolve(metadata.format.duration);
            });
        });

        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = Math.floor(durationInSeconds % 60);
        durationFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        //console.log("Duration (mm:ss):", durationFormatted);
    } catch (error) {
        console.log("Error getting video duration", error);
        throw new ApiError(500, "Error getting video duration");
    }



    if (!videoLocalPath) {
        throw new ApiError(400, "Video file missing")
    }

    let videoFile;
    try {
        videoFile = await uploadOnCloudinary(videoLocalPath)
        console.log("Video file uploaded to cloudinary");
    } catch (error) {
        console.log("Error in uploading video file to cloudinary");
        throw new ApiError(500, "Error in uploading video file to cloudinary")
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is missing")
    }

    let thumbnail;
    try {
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        console.log("Thumbnail uploaded to cloudinary");
    } catch (error) {
        console.log("Error in uploading thumbnail to cloudinary");
        throw new ApiError(500, "Error in uploading thumbnail to cloudinary")
    }

    try {
        const video = await Video.create({
            videoFile: videoFile.url,
            thumbnail: thumbnail.url,
            title: title,
            description: description,
            views: 0,
            duration: durationFormatted,
            isPublished: true,
            owner: req.user._id
        })

        // const uploadedVideo = await Video.findById(video._id)

        // if (!uploadedVideo) {
        //     throw new ApiError(500, "Something went wrong while creating a video")
        // }
        return res.status(201).json(new ApiResponse(
            201,
            video,
            "Video uploaded successfully"
        ))
    } catch (error) {
        console.log("Error while creating video:", error);

        if (videoFile) {
            deleteFromCloudinary(videoFile, { resource_type: "video" })
        }

        if (thumbnail) {
            deleteFromCloudinary(thumbnail)
        }

        throw new ApiError(500, "Something went wrong while saving video");


    }

})


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId)

    //console.log(video)

    if (!video) {
        throw new ApiError(400, "No such video exist")
    }

    if (!video.isPublished && (!req.user || video.owner.toString() !== req.user._id.toString())) {
        throw new ApiError(500, "This video is not published")
    }

    video.views += 1;
    await video.save();

    res.status(200).json(new ApiResponse(
        200,
        video,
        "This is the video"
    ))

})


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(500, "Incorrect video id")
    }

    const newVideoLocalPath = req.file?.path
    if (!newVideoLocalPath) {
        throw new ApiError(500, "Please upload video file")
    }

    let newDurationFormatted;
    try {
        const newDurationInSeconds = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(newVideoLocalPath, (err, metadata) => {
                if (err) return reject(err);
                resolve(metadata.format.duration);
            });
        });

        const minutes = Math.floor(newDurationInSeconds / 60);
        const seconds = Math.floor(newDurationInSeconds % 60);
        newDurationFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        console.log("New Video Duration (mm:ss):", newDurationFormatted);
    } catch (error) {
        console.log("Error getting video duration", error);
        throw new ApiError(500, "Error getting video duration");
    }


    let newVideo;
    try {
        newVideo = await uploadOnCloudinary(newVideoLocalPath)
        console.log("Video uploaded to cloudinary");
    } catch (error) {
        throw new ApiError(500, "Something went wrong with uploading video on cloudinary")
    }

    const oldVideo = await Video.findById(videoId)
    if (!oldVideo) {
        throw new ApiError(500, "No such video exist")
    }



    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                videoFile: newVideo.url,
                duration: newDurationFormatted
            }
        },
        { new: true }
    )

    res.status(200).json(new ApiResponse(
        200,
        video,
        "Video updated successfully"
    ))

})


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(500, "Invalid video id")
    }

    let video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(500, "No video with this videoId exist")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    const getPublicIdFromUrl = (url) => url.split('/').pop().split('.')[0];

    console.log(getPublicIdFromUrl(video.videoFile));


    deleteFromCloudinary(getPublicIdFromUrl(video.videoFile), { resource_type: "video" });
    deleteFromCloudinary(getPublicIdFromUrl(video.thumbnail), { resource_type: "image" });

    video = await Video.findByIdAndDelete(videoId)


    res.status(200).json(new ApiResponse(
        200,
        {},
        "Video is successfully deleted"
    ))
})


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(500, "Invalid video id")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(500, "No video exist")
    }

    video.isPublished = !video.isPublished
    await video.save()

    //agar findByIdAndUpdate use karna hai toh isPublished: !video.isPublished hoga

    res.status(200).json(new ApiResponse(
        200,
        video,
        "Toggled the pubished status of video"
    ))

})


export {
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getAllVideos,
    userAllVideo
}