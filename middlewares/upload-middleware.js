const multer = require('multer');
const mkdirp = require('mkdirp'); // Import mkdirp

mkdirp.sync('uploads/'); // This ensures the folder is created before handling requests

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Save files to 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Generate a unique filename
    },
});

const upload = multer({ storage });
module.exports = upload;