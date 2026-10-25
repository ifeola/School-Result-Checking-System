import { Pool } from "pg";
import { config } from "dotenv";
import type { queryValue } from "../types/type.ts";

config();
const connectionString = process.env.DATABASE_URL!;
const useSsl = Boolean(connectionString) && process.env.DB_SSL !== "false";
const sql = new Pool({
	// user: process.env.DB_USER,
	// host: process.env.DB_HOST,
	// database: process.env.DB_NAME,
	// password: process.env.DB_PASSWORD,
	// port: Number(process.env.DB_PORT) as number,
	connectionString,
	ssl: useSsl
		? {
				// Set DB_SSL_REJECT_UNAUTHORIZED=true once the database
				// provider's CA certificate is trusted by the deployment.
				rejectUnauthorized:
					process.env.DB_SSL_REJECT_UNAUTHORIZED === "true",
			}
		: false,
});

export default {
	query: (text: string, params?: queryValue) => sql.query(text, params),
	sql,
};
