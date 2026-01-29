import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "thrift-store",
        allowed_formats: ["jpg", "png", "jpeg"],
    },
});

const upload = multer({ storage });

export default upload;
