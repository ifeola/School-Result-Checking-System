import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../../types/type.ts";
import {
	ForbiddenError,
	UnauthorizedError,
} from "../../services/Custom-Errors.ts";

const authorize = (allowedRoles: string[]) => {
	return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		if (!req.user) {
			return next(new UnauthorizedError());
		}

		const effectiveRole =
			req.user.permissionLevel === "super_admin"
				? "super_admin"
				: req.user.permissionLevel === "staff_admin"
					? "staff_admin"
					: req.user.role;

		if (!allowedRoles.includes(effectiveRole)) {
			return next(new ForbiddenError());
		}

		next();
	};
};

export default authorize;
