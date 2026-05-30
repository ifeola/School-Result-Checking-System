import { Pool } from "pg";
import { config } from "dotenv";
import type { queryValue } from "../types/type.ts";

config();
const connectionString = process.env.DATABASE_URL!;
const sql = new Pool({
	connectionString,
	ssl: connectionString ? { rejectUnauthorized: false } : false,
});

export default {
	query: (text: string, params?: queryValue) => sql.query(text, params),
	sql,
};
