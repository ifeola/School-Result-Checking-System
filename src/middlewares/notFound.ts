import type { NextFunction, Response, Request } from "express";
import { CustomError } from "../services/Custom-Errors.ts";

const notFound = (req: Request, res: Response, next: NextFunction) => {
	return next(
		new CustomError(404, `Route not found: ${req.method} ${req.url}`),
	);
};

export default notFound;
