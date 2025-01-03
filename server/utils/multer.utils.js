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

const upload = multer({ storage });

export { upload };

