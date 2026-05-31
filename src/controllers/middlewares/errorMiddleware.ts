import type {
	Request,
	NextFunction,
	Response,
	ErrorRequestHandler,
} from "express";
import { CustomError } from "../../services/Custom-Errors.ts";

const errorMiddleware: ErrorRequestHandler = (
	err,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (err instanceof CustomError) {
		return res
			.status(err.status)
			.json({ success: false, message: err.message });
	}

	res.status(500).json({
		success: false,
		message: err.message || "Internal Server Error",
	});
};

export default errorMiddleware;
