import type { ValidationError as ExpressValidationError } from "express-validator";

class CustomError extends Error {
	public readonly status: number;
	public readonly isOperational: boolean;
	constructor(status: number, message: string) {
		super(message);
		this.status = status;
		this.isOperational = true;
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}
}

class NotFoundError extends CustomError {
	constructor(message = "Resources not found.") {
		super(404, message);
		this.name = "NotFoundError";
	}
}

class ValidationError extends CustomError {
	constructor(
		message:
			| ExpressValidationError[]
			| string = "Validation error, please try again.",
	) {
		const msg = Array.isArray(message)
			? message.map((e) => e.msg).join(", ")
			: message;
		super(400, msg);
		this.name = "ValidationError";
	}
}

class UnauthorizedError extends CustomError {
	constructor(message = "Authentication falied, please try again.") {
		super(401, message);
		this.name = "UnauthorizedError";
	}
}

class ForbiddenError extends CustomError {
	constructor(message = "Forbidden.") {
		super(403, message);
		this.name = "ForbiddenError";
	}
}

class ConflictError extends CustomError {
	constructor(message: string) {
		super(409, message);
		this.name = "ConflictError";
	}
}

export {
	CustomError,
	NotFoundError,
	ValidationError,
	UnauthorizedError,
	ForbiddenError,
	ConflictError,
};
