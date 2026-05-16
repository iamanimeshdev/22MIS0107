import { Request, Response, NextFunction } from 'express';
// @ts-ignore
import { Log } from '../../../Logging_Middleware/index.js';

export async function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
    const message = `[${req.method}] ${req.originalUrl}`;
    
    try {
        await Log('backend', 'info', 'middleware', message);
    } catch (e) {

    }
    
    next();
}
