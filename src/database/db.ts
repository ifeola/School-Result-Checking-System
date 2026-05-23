import { Pool } from "pg";
import { config } from "dotenv";

type queryValue = string | number | null | Date | boolean;
config();
const connectionString = process.env.DATABASE_URL!;
const sql = new Pool({
	connectionString,
	ssl: connectionString ? { rejectUnauthorized: false } : false,
});

export default {
	query: (text: string, params?: queryValue[]) => sql.query(text, params),
	sql,
};
