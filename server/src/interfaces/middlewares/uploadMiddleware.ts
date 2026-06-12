import multer from 'multer';
import { AppError } from '../../domain/errors/AppError';
import { HttpStatusCode } from '../../domain/enums/HttpStatusCode';

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', HttpStatusCode.BAD_REQUEST));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});
