import bcrypt from "bcrypt";
import type { Response, Request, NextFunction } from "express";
import { matchedData, validationResult } from "express-validator";
import { NotFoundError, ValidationError } from "../services/Custom-Errors.ts";
import User from "../services/User.ts";
import generateToken from "../utils/generateToken.ts";

const login = async (req: Request, res: Response, next: NextFunction) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({
			errors: errors.array(),
		});
	}

	const { identifier, password } = matchedData(req);
	try {
		const existingUser = await User.getUserByIdentifier(identifier);
		if (!existingUser) {
			return next(new NotFoundError("Invalid username or password"));
		}

		const isPasswordMatch = await bcrypt.compare(
			password,
			existingUser.password_hash,
		);
		if (!isPasswordMatch) {
			return next(new ValidationError("Invalid username or password"));
		}

		const identity = existingUser.email ?? existingUser.admission_number;
		generateToken(
			{
				id: existingUser.id,
				identifier: identity,
				role: existingUser.role,
				permissionLevel: existingUser.permission_level,
			},
			res,
		);

		return res.status(200).json({
			success: true,
			message: "User successfully logged in.",
			data: { user: { ...existingUser, password_hash: null } },
		});
	} catch (error) {
		next(error);
	}
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
	res.clearCookie("jwt", {
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		sameSite: "lax",
	});

	res.status(200).json({
		success: true,
		message: "Logged out successfully",
	});
};

export { login, logout };
