import type { RequestHandler } from "express";
import rateLimit, {
	type Options,
	type RateLimitExceededEventHandler,
	type Store,
} from "express-rate-limit";
import slowDown from "express-slow-down";
import type { AppEnv } from "../config/env.ts";

export const RATE_LIMIT_MESSAGE =
	"Too many requests. Please try again later.";

/**
 * The default store is express-rate-limit's in-memory store, which is correct
 * for a single process. To move to Redis later, call this once at startup:
 *
 *   import { RedisStore } from "rate-limit-redis";
 *   setRateLimitStoreFactory((prefix) =>
 *     new RedisStore({
 *       prefix: `rl:${prefix}:`,
 *       sendCommand: (...args) => redisClient.sendCommand(args),
 *     }),
 *   );
 *
 * A new store instance must be returned for every prefix: the library refuses
 * to share one store between multiple limiter instances.
 */
export type RateLimitStoreFactory = (prefix: string) => Store | undefined;

let storeFactory: RateLimitStoreFactory | undefined;

export const setRateLimitStoreFactory = (factory: RateLimitStoreFactory) => {
	storeFactory = factory;
};

const createStore = (prefix: string): Store | undefined => {
	if (!storeFactory) return undefined;
	return storeFactory(prefix);
};

const rateLimitHandler: RateLimitExceededEventHandler = (
	_req,
	res,
	_next,
	optionsUsed,
) => {
	res.status(optionsUsed.statusCode).json({
		success: false,
		message: RATE_LIMIT_MESSAGE,
	});
};

const baseOptions = {
	standardHeaders: "draft-8" as const,
	legacyHeaders: false,
	statusCode: 429,
	message: RATE_LIMIT_MESSAGE,
	handler: rateLimitHandler,
	skip: (req: Parameters<RequestHandler>[0]) => req.method === "OPTIONS",
} satisfies Partial<Options>;

export type RateLimiters = {
	global: RequestHandler;
	auth: RequestHandler;
	expensive: RequestHandler;
	loginSlowDown: RequestHandler;
};

const buildLimiter = (
	prefix: string,
	{ windowMs, limit }: { windowMs: number; limit: number },
	extra: Partial<Options> = {},
): RequestHandler => {
	const store = createStore(prefix);

	return rateLimit({
		...baseOptions,
		windowMs,
		limit,
		identifier: prefix,
		...(store ? { store } : {}),
		...extra,
	});
};

export const createRateLimiters = (env: AppEnv): RateLimiters => {
	const global = buildLimiter("global", env.rateLimit.global);

	const auth = buildLimiter("auth", env.rateLimit.auth, {
		// Only failed login attempts should count toward the lockout.
		skipSuccessfulRequests: true,
	});

	const expensive = buildLimiter("expensive", env.rateLimit.expensive);

	const slowDownStore = createStore("login-slowdown");
	const noopSlowDown: RequestHandler = (_req, _res, next) => next();
	const loginSlowDown = env.loginSlowDown.enabled
		? slowDown({
				windowMs: env.loginSlowDown.windowMs,
				delayAfter: env.loginSlowDown.delayAfter,
				delayMs: () => env.loginSlowDown.delayMs,
				maxDelayMs: env.loginSlowDown.maxDelayMs,
				...(slowDownStore ? { store: slowDownStore } : {}),
				standardHeaders: false,
				legacyHeaders: false,
				skip: (req) => req.method === "OPTIONS",
		  })
		: noopSlowDown;

	return { global, auth, expensive, loginSlowDown };
};

const useLimiter = (name: keyof RateLimiters): RequestHandler => {
	return (req, res, next) => {
		const limiters = req.app.locals.rateLimiters as RateLimiters | undefined;

		if (!limiters) return next();

		return limiters[name](req, res, next);
	};
};

// Route files import these stable wrappers; createApp() supplies the concrete
// limiter instances through app.locals so tests can use their own limits.
export const globalLimiter: RequestHandler = useLimiter("global");
export const authLimiter: RequestHandler = useLimiter("auth");
export const expensiveLimiter: RequestHandler = useLimiter("expensive");
export const loginSlowDown: RequestHandler = useLimiter("loginSlowDown");
