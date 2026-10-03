import type { Request, Response, NextFunction } from "express";

function errorCatcher(err: any, req: Request, res: Response, next: NextFunction)
{
    console.error(err)
    if (res.headersSent) {
        return next(err)
    }

    const errStatusIsValid = (typeof(err.status) === "number" && Number.isInteger(err.status) && err.status >= 400 && err.status <= 599)
    let status : number
    if (!errStatusIsValid || err.status >= 500) {
        status = 500
    }
    else {
        status = err.status
    }
    return res.status(status).json({error: status == 500 ? "internal server error" : "bad request"})
}

export default errorCatcher