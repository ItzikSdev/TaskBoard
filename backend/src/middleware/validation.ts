import { Request, Response, NextFunction } from "express";
import { param, validationResult } from "express-validator";
import AppError from "../utils/appError";


export const validateTaskId = [
    param('id').notEmpty().withMessage('Task ID is required').isMongoId().withMessage('Invalid Task ID format'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array().map(err => err.msg).join(', ') , 400))
        }
        next()
    }
]