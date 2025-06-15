import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import dotenv from "dotenv"

dotenv.config()


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});




const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) {
        console.error("❌ No localFilePath provided");
        return null
    }
    try {
        console.log("📤 Uploading to Cloudinary:", localFilePath);
        const response = await cloudinary.uploader.upload(
            localFilePath, {
            resource_type: "auto"
        }
        )

        console.log("File uploaded on cloudinary. File src: " + response.url);

        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        console.error("❌ Cloudinary upload failed:", error);
        fs.unlinkSync(localFilePath)
        return null
    }
}


const deleteFromCloudinary = async (publicId, options = {}) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, options)
        console.log("Delted from cloudinary");

    } catch (error) {
        console.log("Error deleting from cloudinary", error);
        return null;
    }
}

export { uploadOnCloudinary, deleteFromCloudinary } 