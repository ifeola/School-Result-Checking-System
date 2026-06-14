import jwt from "jsonwebtoken";
import { config } from "dotenv";
import type { Response, NextFunction } from "express";
import { UnauthorizedError } from "../services/Custom-Errors.ts";
import type { AuthenticatedRequest } from "../types/type.ts";

config();

const authenticate = (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	} else if (req.cookies?.jwt) {
		token = req.cookies.jwt;
	}

	if (!token) {
		return next(new UnauthorizedError());
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
			id: string;
			identifier: string;
			role: string;
			permissionLevel: "super_admin" | "staff_admin" | null;
		};

		req.user = decoded;
		next();
	} catch (error) {
		next(error);
	}
};

export default authenticate;
