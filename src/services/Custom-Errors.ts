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

class BadRequestError extends CustomError {
	constructor(
		message = "The server cannot or will not process the request due to an apparent client error.",
	) {
		super(400, message);
		this.name = "BadRequestError";
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

export {
	CustomError,
	NotFoundError,
	ValidationError,
	BadRequestError,
	UnauthorizedError,
	ForbiddenError,
};
