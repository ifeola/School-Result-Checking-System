import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../types/type.ts";
import {
	ForbiddenError,
	UnauthorizedError,
} from "../services/Custom-Errors.ts";

const authorize = (allowedRoles: string[]) => {
	return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		if (!req.user) {
			return next(new UnauthorizedError());
		}

		if (!allowedRoles.includes(req.user.role)) {
			return next(new ForbiddenError());
		}

		next();
	};
};

export default authorize;
