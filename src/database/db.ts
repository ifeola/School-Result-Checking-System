import { Pool } from "pg";
import { config } from "dotenv";
import type { queryValue } from "../types/type.ts";

config();
const connectionString = process.env.DATABASE_URL!;
const useSsl = Boolean(connectionString) && process.env.DB_SSL !== "false";
const sql = new Pool({
	connectionString,
	ssl: useSsl
		? {
				// Set DB_SSL_REJECT_UNAUTHORIZED=true once the database
				// provider's CA certificate is trusted by the deployment.
				rejectUnauthorized:
					process.env.DB_SSL_REJECT_UNAUTHORIZED === "true",
			}
		: false,
	max: 20,
	idleTimeoutMillis: 30_000,
	connectionTimeoutMillis: 10_000,
	statement_timeout: 30_000,
	query_timeout: 30_000,
});

export default {
	query: (text: string, params?: queryValue) => sql.query(text, params),
	sql,
};
