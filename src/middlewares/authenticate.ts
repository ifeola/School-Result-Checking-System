import jwt from "jsonwebtoken";
import type { Response, NextFunction } from "express";
import { loadEnv } from "../config/env.ts";
import { UnauthorizedError } from "../services/Custom-Errors.ts";
import type { AuthenticatedRequest } from "../types/type.ts";

const env = loadEnv();

const authenticate = (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	let token: string | undefined;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer ")
	) {
		token = req.headers.authorization.split(" ")[1];
	} else if (req.cookies?.jwt) {
		token = req.cookies.jwt;
	}

	if (!token) {
		return next(new UnauthorizedError());
	}

	try {
		const decoded = jwt.verify(token, env.jwt.secret, {
			algorithms: ["HS256"],
			issuer: env.jwt.issuer,
			audience: env.jwt.audience,
		}) as {
			id?: string;
			identifier?: string;
			role?: string;
		};

		if (!decoded?.id || !decoded?.role) {
			return next(new UnauthorizedError());
		}

		req.user = {
			id: decoded.id,
			identifier: decoded.identifier ?? "",
			role: decoded.role,
		};

		return next();
	} catch {
		return next(new UnauthorizedError());
	}
};

export default authenticate;
