import multer from "multer";
import { AppError } from "../../domain/errors/AppError";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { AppConstants } from "../../domain/constants";

const storage = multer.memoryStorage();

import { Request } from 'express';

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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
        fileSize: AppConstants.MAX_FILE_SIZE_BYTES,
    }
});
