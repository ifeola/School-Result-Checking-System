import { loadEnv } from "./config/env.ts";
import createApp from "./app.ts";

const env = loadEnv();
const app = createApp({ env });

const server = app.listen(env.port, () => {
	console.log(`Server running on localhost:${env.port}`);
});

const shutdown = (signal: string) => {
	console.log(`${signal} received, closing HTTP server.`);
	server.close((error) => {
		if (error) {
			console.error("Error while closing the HTTP server:", error);
			process.exitCode = 1;
		}
	});
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
