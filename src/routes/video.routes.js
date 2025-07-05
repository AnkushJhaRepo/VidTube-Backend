import { Router } from "express";
import {
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getAllVideos,
    userAllVideo
} from "../controllers/video.contollers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";


const router = Router();

//unsecured routes

router.route("/v/:videoId").get(getVideoById)
router.route("/all-videos").get(getAllVideos)

//secured routes

router.route("/upload-video").post(verifyJWT,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishAVideo
)
router.route("/u/:videoId").post(verifyJWT, upload.single("videoFile"), updateVideo)
router.route("/d/:videoId").delete(verifyJWT, deleteVideo)
router.route("/p/:videoId").patch(verifyJWT, togglePublishStatus)
router.route("/user-video/:ownerId").get(verifyJWT, userAllVideo)

export default router