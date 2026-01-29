const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "thrift-store",
        allowed_formats: ["jpg", "png", "jpeg"],
    },
});

const upload = multer({ storage });

module.exports = upload;
