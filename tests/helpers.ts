import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import createApp from "../src/app.ts";
import { loadEnv } from "../src/config/env.ts";

export const baseEnv = () => loadEnv();

export const createTestApp = (overrides: NodeJS.ProcessEnv = {}) =>
	createApp({ env: loadEnv(overrides) });

export const signToken = (
	role: "student" | "teacher" | "staff_admin" | "super_admin",
	id: string = randomUUID(),
) => {
	const env = baseEnv();

	return jwt.sign(
		{
			id,
			identifier: role === "student" ? "DEAC-2024-0001" : `${role}@test.local`,
			role,
		},
		env.jwt.secret,
		{
			algorithm: "HS256",
			expiresIn: "1h",
			issuer: env.jwt.issuer,
			audience: env.jwt.audience,
		},
	);
};
