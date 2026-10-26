import { loadEnv } from "./config/env.ts";
import createApp from "./app.ts";
import db from "./database/db.ts";
import { closeBrowser } from "./controllers/generateResults.controller.ts";

const env = loadEnv();
const app = createApp({ env });

const server = app.listen(env.port, () => {
	console.log(`Server running on localhost:${env.port}`);
});

let shuttingDown = false;

const shutdown = (signal: string) => {
	if (shuttingDown) return;
	shuttingDown = true;

	console.log(`${signal} received, closing HTTP server.`);

	const forceExit = setTimeout(() => {
		console.error("Graceful shutdown timed out; forcing exit.");
		process.exit(1);
	}, 10_000);
	forceExit.unref();

	server.close(async (error) => {
		clearTimeout(forceExit);

		// Release database and browser resources after in-flight requests finish.
		await Promise.allSettled([db.sql.end(), closeBrowser()]);

		if (error) {
			console.error("Error while closing the HTTP server:", error);
			process.exitCode = 1;
		}

		process.exit(process.exitCode ?? 0);
	});
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
