import { config } from "dotenv";
import { z } from "zod";

config();

const envBoolean = (defaultValue: boolean) =>
	z.preprocess((value) => {
		if (value === undefined || value === "") return defaultValue;
		if (typeof value === "boolean") return value;

		if (typeof value === "string") {
			const normalized = value.trim().toLowerCase();
			if (["true", "1", "yes", "on"].includes(normalized)) return true;
			if (["false", "0", "no", "off"].includes(normalized)) return false;
		}

		return value;
	}, z.boolean());

const optionalEnvBoolean = z.preprocess((value) => {
	if (value === undefined || value === "") return undefined;
	if (typeof value === "boolean") return value;

	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();
		if (["true", "1", "yes", "on"].includes(normalized)) return true;
		if (["false", "0", "no", "off"].includes(normalized)) return false;
	}

	return value;
}, z.boolean().optional());

const envInt = (defaultValue: number, min: number, max: number) =>
	z.preprocess(
		(value) => (value === undefined || value === "" ? defaultValue : value),
		z.coerce.number().int().min(min).max(max),
	);

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("development"),
	PORT: envInt(3000, 1, 65535),
	DATABASE_URL: z.string().min(1).optional(),

	JWT_SECRET: z
		.string()
		.min(32, "JWT_SECRET must be at least 32 characters long."),
	JWT_EXPIRES_IN: z.string().min(1).default("1h"),
	JWT_ISSUER: z.string().min(1).default("school-result-checking-system"),
	JWT_AUDIENCE: z.string().min(1).default("school-result-checking-system-web"),
	BCRYPT_ROUNDS: envInt(12, 10, 15),

	CORS_ORIGINS: z.string().default("http://localhost:5173"),
	TRUST_PROXY: z.string().default("false"),

	JSON_BODY_LIMIT: z.string().min(1).default("100kb"),
	URLENCODED_BODY_LIMIT: z.string().min(1).default("100kb"),
	URLENCODED_PARAMETER_LIMIT: envInt(100, 1, 1000),

	RATE_LIMIT_WINDOW_MS: envInt(15 * 60 * 1000, 1000, 24 * 60 * 60 * 1000),
	RATE_LIMIT_MAX: envInt(100, 1, 1_000_000),
	AUTH_RATE_LIMIT_WINDOW_MS: envInt(15 * 60 * 1000, 1000, 24 * 60 * 60 * 1000),
	AUTH_RATE_LIMIT_MAX: envInt(7, 1, 1_000_000),
	EXPENSIVE_RATE_LIMIT_WINDOW_MS: envInt(
		15 * 60 * 1000,
		1000,
		24 * 60 * 60 * 1000,
	),
	EXPENSIVE_RATE_LIMIT_MAX: envInt(20, 1, 1_000_000),
	RATE_LIMIT_STORE: z.enum(["memory", "redis"]).default("memory"),

	LOGIN_SLOWDOWN_ENABLED: envBoolean(true),
	LOGIN_SLOWDOWN_WINDOW_MS: envInt(15 * 60 * 1000, 1000, 24 * 60 * 60 * 1000),
	LOGIN_SLOWDOWN_DELAY_AFTER: envInt(3, 0, 1_000_000),
	LOGIN_SLOWDOWN_DELAY_MS: envInt(500, 0, 60_000),
	LOGIN_SLOWDOWN_MAX_DELAY_MS: envInt(5000, 0, 300_000),

	COOKIE_SECURE: optionalEnvBoolean,
	COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).optional(),
	COOKIE_DOMAIN: z.string().min(1).optional(),

	PUPPETEER_NO_SANDBOX: envBoolean(false),
});

type ParsedEnv = z.infer<typeof envSchema>;

export type CookieSameSite = "lax" | "strict" | "none";
export type TrustProxySetting = boolean | number | string;

export type AppEnv = {
	nodeEnv: ParsedEnv["NODE_ENV"];
	isProduction: boolean;
	port: number;
	databaseUrl: string | undefined;
	jwt: {
		secret: string;
		expiresIn: string;
		issuer: string;
		audience: string;
	};
	bcryptRounds: number;
	corsOrigins: string[];
	trustProxy: TrustProxySetting;
	body: {
		jsonLimit: string;
		urlencodedLimit: string;
		parameterLimit: number;
	};
	rateLimit: {
		global: { windowMs: number; limit: number };
		auth: { windowMs: number; limit: number };
		expensive: { windowMs: number; limit: number };
		store: "memory" | "redis";
	};
	loginSlowDown: {
		enabled: boolean;
		windowMs: number;
		delayAfter: number;
		delayMs: number;
		maxDelayMs: number;
	};
	cookie: {
		secure: boolean;
		sameSite: CookieSameSite;
		domain?: string;
	};
	puppeteer: {
		noSandbox: boolean;
	};
};

/**
 * Express accepts `false`, a hop count, or a subnet string for `trust proxy`.
 * A literal `true` is intentionally converted to one hop: trusting every
 * `X-Forwarded-For` value lets clients spoof their IP and bypass rate limits.
 */
export const parseTrustProxy = (value: string): TrustProxySetting => {
	const normalized = value.trim().toLowerCase();

	if (!normalized || normalized === "false" || normalized === "0") return false;
	if (normalized === "true") return 1;
	if (/^\d+$/.test(normalized)) return Number(normalized);

	return value.trim();
};

const parseCorsOrigins = (value: string): string[] => {
	const origins = value
		.split(",")
		.map((origin) => origin.trim().replace(/\/+$/, ""))
		.filter(Boolean);

	if (origins.length === 0) {
		throw new Error("CORS_ORIGINS must contain at least one origin.");
	}

	if (origins.includes("*")) {
		throw new Error(
			"CORS_ORIGINS cannot contain '*' because credentials are enabled.",
		);
	}

	return [...new Set(origins)];
};

export const loadEnv = (overrides: NodeJS.ProcessEnv = {}): AppEnv => {
	const parsed = envSchema.safeParse({ ...process.env, ...overrides });

	if (!parsed.success) {
		const details = parsed.error.issues
			.map((issue) => `  - ${issue.path.join(".") || "env"}: ${issue.message}`)
			.join("\n");

		throw new Error(`Invalid environment configuration:\n${details}`);
	}

	const data = parsed.data;
	const isProduction = data.NODE_ENV === "production";

	if (isProduction && !data.DATABASE_URL) {
		throw new Error("DATABASE_URL is required in production.");
	}

	if (data.RATE_LIMIT_STORE === "redis") {
		throw new Error(
			"RATE_LIMIT_STORE=redis is not implemented yet. " +
				"Call setRateLimitStoreFactory() with a Redis store before enabling it.",
		);
	}

	return {
		nodeEnv: data.NODE_ENV,
		isProduction,
		port: data.PORT,
		databaseUrl: data.DATABASE_URL,
		jwt: {
			secret: data.JWT_SECRET,
			expiresIn: data.JWT_EXPIRES_IN,
			issuer: data.JWT_ISSUER,
			audience: data.JWT_AUDIENCE,
		},
		bcryptRounds: data.BCRYPT_ROUNDS,
		corsOrigins: parseCorsOrigins(data.CORS_ORIGINS),
		trustProxy: parseTrustProxy(data.TRUST_PROXY),
		body: {
			jsonLimit: data.JSON_BODY_LIMIT,
			urlencodedLimit: data.URLENCODED_BODY_LIMIT,
			parameterLimit: data.URLENCODED_PARAMETER_LIMIT,
		},
		rateLimit: {
			global: {
				windowMs: data.RATE_LIMIT_WINDOW_MS,
				limit: data.RATE_LIMIT_MAX,
			},
			auth: {
				windowMs: data.AUTH_RATE_LIMIT_WINDOW_MS,
				limit: data.AUTH_RATE_LIMIT_MAX,
			},
			expensive: {
				windowMs: data.EXPENSIVE_RATE_LIMIT_WINDOW_MS,
				limit: data.EXPENSIVE_RATE_LIMIT_MAX,
			},
			store: data.RATE_LIMIT_STORE,
		},
		loginSlowDown: {
			enabled: data.LOGIN_SLOWDOWN_ENABLED,
			windowMs: data.LOGIN_SLOWDOWN_WINDOW_MS,
			delayAfter: data.LOGIN_SLOWDOWN_DELAY_AFTER,
			delayMs: data.LOGIN_SLOWDOWN_DELAY_MS,
			maxDelayMs: data.LOGIN_SLOWDOWN_MAX_DELAY_MS,
		},
		cookie: {
			secure: data.COOKIE_SECURE ?? isProduction,
			sameSite: data.COOKIE_SAME_SITE ?? (isProduction ? "none" : "lax"),
			...(data.COOKIE_DOMAIN ? { domain: data.COOKIE_DOMAIN } : {}),
		},
		puppeteer: {
			noSandbox: data.PUPPETEER_NO_SANDBOX,
		},
	};
};
