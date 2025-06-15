import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
)

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser())

//import routes
import userRouter from "./routes/user.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import videoRoute from "./routes/video.routes.js"
import tweetRoute from "./routes/tweet.routes.js"
import likeRoute from "./routes/like.routes.js"
import commentRoute from "./routes/comment.routes.js"
import subscriptionRoute from "./routes/subscription.routes.js"
import playlistRoute from "./routes/playlist.routes.js"
import { errorHandler } from "./middlewares/error.middlewares.js";


//routes
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRoute)
app.use("/api/v1/tweets", tweetRoute)
app.use("/api/v1/likes", likeRoute)
app.use("/api/v1/comments", commentRoute)
app.use("/api/v1/subscriptions", subscriptionRoute)
app.use("/api/v1/playlists", playlistRoute)


app.use(errorHandler)

export { app }