import jwt, { type SignOptions } from "jsonwebtoken";
import type { CookieOptions, Response } from "express";
import { loadEnv } from "../config/env.ts";

const env = loadEnv();

export type AuthCookieOptions = CookieOptions;

export const getAuthCookieOptions = (): AuthCookieOptions => ({
	httpOnly: true,
	secure: env.cookie.secure,
	sameSite: env.cookie.sameSite,
	path: "/",
	...(env.cookie.domain ? { domain: env.cookie.domain } : {}),
});

const generateToken = (
	user: {
		id: string;
		identifier: string;
		role: "student" | "teacher" | "staff_admin" | "super_admin";
	},
	res: Response,
) => {
	const token = jwt.sign(
		{
			id: user.id,
			identifier: user.identifier,
			role: user.role,
		},
		env.jwt.secret,
		{
			algorithm: "HS256",
			expiresIn: env.jwt.expiresIn as NonNullable<SignOptions["expiresIn"]>,
			issuer: env.jwt.issuer,
			audience: env.jwt.audience,
		},
	);

	const decoded = jwt.decode(token) as { exp?: number } | null;
	const maxAge = decoded?.exp
		? Math.max(0, decoded.exp * 1000 - Date.now())
		: undefined;

	res.cookie("jwt", token, {
		...getAuthCookieOptions(),
		...(maxAge !== undefined ? { maxAge } : {}),
	});

	return token;
};

export default generateToken;
