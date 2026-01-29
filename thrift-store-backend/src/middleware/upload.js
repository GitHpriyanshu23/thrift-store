import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

console.log('🔧 Loading Cloudinary config...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key exists:', !!process.env.CLOUDINARY_API_KEY);
console.log('API Secret exists:', !!process.env.CLOUDINARY_API_SECRET);

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('✅ Cloudinary configured');

// Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "thrift-store",
        allowed_formats: ["jpg", "png", "jpeg", "webp", "avif", "gif", "bmp"],
    },
});

console.log('✅ CloudinaryStorage initialized');

const upload = multer({ storage });

console.log('✅ Multer upload middleware ready');

export default upload;
