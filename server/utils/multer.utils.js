import { config } from 'dotenv';
config();
import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';

const mongoURI = process.env.MONGO_URI;

const storage = new GridFsStorage({
  url: mongoURI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      bucketName: 'uploads', 
      filename: `${Date.now()}-${file.originalname}`
    };
  }
});

// Set file size limit to 1MB (1024 * 1024 bytes)
const upload = multer({ 
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 1MB limit
  fileFilter: (req, file, cb) => {
    if (file.size > 3 * 1024 * 1024) {
      return cb(new Error("File size must be less than 3MB"), false);
    }
    cb(null, true);
  }
});
  
export { upload };
