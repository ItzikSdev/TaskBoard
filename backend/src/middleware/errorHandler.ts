import { Request, Response, NextFunction } from "express";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const errStatus = err.statusCode || 500;
    const errMsg = err.message || "error"

    if (process.env.NODE_ENV === "dev") {
        res.status(errStatus).json({
            success: false,
            status: errStatus,
            message: errMsg,
            stack: err.stack
        })
    }

    if (process.env.NODE_ENV === "production") {
        if (err.isOperational) {
            return res.status(errStatus).json({
                success: false,
                status: errStatus,
                message: err.message || "Something went wrong",
            })
        }

        return res.status(500).json({
            success: false,
            status: 'error',
            message: "Something went wrong on the server",
        })
    }
    next()
}
export default errorHandler