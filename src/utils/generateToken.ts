import { config } from "dotenv";
import jwt from "jsonwebtoken";
import { type Response } from "express";

config();
const generateToken = (
	user: {
		id: string;
		identifier: string;
		role: "student" | "teacher" | "staff_admin" | "super_admin";
	},
	res: Response
) => {
	const JWT_SECRET = process.env.JWT_SECRET as string;

	const token = jwt.sign(
		{
			id: user.id,
			identifier: user.identifier,
			role: user.role,
		},
		JWT_SECRET,
		{
			expiresIn: "1d",
		}
	);

	res.cookie("jwt", token, {
		// secure: true, // process.env.NODE_ENV === "production"
		// sameSite: "none", // ← required for cross-origin (different ports)
		secure: process.env.NODE_ENV === "production",
		sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
		httpOnly: true,
		maxAge: 24 * 60 * 60 * 1000, // 1 day
	});

	return token;
};

export default generateToken;
