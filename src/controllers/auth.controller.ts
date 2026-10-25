import bcrypt from "bcrypt";
import type { Response, Request, NextFunction } from "express";
import { UnauthorizedError } from "../services/Custom-Errors.ts";
import User from "../services/User.ts";
import generateToken, {
	getAuthCookieOptions,
} from "../utils/generateToken.ts";

// A valid bcrypt hash used only to keep the unknown-user and wrong-password
// paths roughly the same duration (mitigates user enumeration by timing).
const DUMMY_PASSWORD_HASH =
	"$2b$12$DRNJ9/75m6tmdNP4s6VzBuYTLtzbsYOA6s/8F/641v02L21aJuaBa";
const INVALID_CREDENTIALS_MESSAGE = "Invalid username or password.";

const login = async (req: Request, res: Response, next: NextFunction) => {
	const { identifier, password } = req.body as {
		identifier: string;
		password: string;
	};

	const existingUser = await User.getUserByIdentifier(identifier);

	if (!existingUser) {
		await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
		return next(new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE));
	}

	const isPasswordMatch = await bcrypt.compare(
		password,
		existingUser.password_hash,
	);

	if (!isPasswordMatch) {
		return next(new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE));
	}

	const identity = existingUser.email ?? existingUser.id_number;
	generateToken(
		{
			id: existingUser.id,
			identifier: identity,
			role: existingUser.role,
		},
		res,
	);

	const { password_hash: _passwordHash, ...safeUser } = existingUser;

	return res.status(200).json({
		success: true,
		message: "User successfully logged in.",
		data: { user: safeUser },
	});
};

const logout = async (_req: Request, res: Response, _next: NextFunction) => {
	res.clearCookie("jwt", getAuthCookieOptions());

	res.status(200).json({
		success: true,
		message: "Logged out successfully",
	});
};

export { login, logout };
