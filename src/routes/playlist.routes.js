import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist
} from "../controllers/playlist.controllers.js";


const router = Router()


router.route("/create-playlist").post(verifyJWT, createPlaylist)
router.route("/add-video-to-playlist/:playlistId/:videoId").post(verifyJWT, addVideoToPlaylist)
router.route("/get-user-playlist/:userId").get(getUserPlaylist)
router.route("/get-playlist-by-id/:playlistId").get(getPlaylistById)
router.route("/remove-video-from-playlist/:playlistId/:videoId").patch(verifyJWT, removeVideoFromPlaylist)
router.route("/delete-playlist/:playlistId").delete(verifyJWT, deletePlaylist)
router.route("/update-playlist/:playlistId").patch(verifyJWT, updatePlaylist)


export default router