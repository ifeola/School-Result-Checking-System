process.env.NODE_ENV = "test";
process.env.JWT_SECRET =
	"test-secret-that-is-definitely-long-enough-1234567890";
process.env.JWT_ISSUER = "school-result-checking-system";
process.env.JWT_AUDIENCE = "school-result-checking-system-web";
process.env.CORS_ORIGINS = "http://localhost:5173";
process.env.TRUST_PROXY = "false";
process.env.RATE_LIMIT_STORE = "memory";
process.env.RATE_LIMIT_MAX = "1000";
process.env.AUTH_RATE_LIMIT_MAX = "1000";
process.env.LOGIN_SLOWDOWN_ENABLED = "false";
process.env.BCRYPT_ROUNDS = "10";
process.env.DATABASE_URL = "postgres://test:test@127.0.0.1:5432/test";
process.env.DB_SSL = "false";
process.env.COOKIE_SAME_SITE = "lax";
