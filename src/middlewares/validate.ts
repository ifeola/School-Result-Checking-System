import type { RequestHandler } from "express";
import { type ZodType } from "zod";
import { ValidationError } from "../services/Custom-Errors.ts";

type ValidationSchemas = {
	body?: ZodType;
	params?: ZodType;
	query?: ZodType;
};

const formatIssues = (
	source: "body" | "params" | "query",
	issues: { path: PropertyKey[]; message: string }[],
): string[] =>
	issues.map((issue) => {
		const path = issue.path.map(String).join(".");
		return `${source}${path ? `.${path}` : ""}: ${issue.message}`;
	});

/**
 * Parses the selected request inputs with Zod and replaces req.body/req.params
 * with the parsed values. req.query is validated but not replaced because
 * Express 5 exposes it as a read-only getter.
 */
export const validate =
	(schemas: ValidationSchemas): RequestHandler =>
	(req, _res, next) => {
		const errors: string[] = [];
		let parsedBody: unknown;
		let parsedParams: unknown;

		if (schemas.body) {
			const result = schemas.body.safeParse(req.body);
			if (result.success) {
				parsedBody = result.data;
			} else {
				errors.push(...formatIssues("body", result.error.issues));
			}
		}

		if (schemas.params) {
			const result = schemas.params.safeParse(req.params);
			if (result.success) {
				parsedParams = result.data;
			} else {
				errors.push(...formatIssues("params", result.error.issues));
			}
		}

		if (schemas.query) {
			const result = schemas.query.safeParse(req.query);
			if (!result.success) {
				errors.push(...formatIssues("query", result.error.issues));
			}
		}

		if (errors.length > 0) {
			return next(new ValidationError(errors.join("; ")));
		}

		if (schemas.body) {
			req.body = parsedBody;
		}

		if (schemas.params) {
			req.params = parsedParams as typeof req.params;
		}

		return next();
	};
