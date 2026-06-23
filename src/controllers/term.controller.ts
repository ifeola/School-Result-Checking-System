import type { NextFunction, Request, Response } from "express";
import { Term } from "../services/Props.ts";
import { NotFoundError } from "../services/Custom-Errors.ts";

const getTerms = async (req: Request, res: Response, next: NextFunction) => {
	const response = await Term.getTerms();
	if (response.length === 0) {
		return next(new NotFoundError("No results found for term."));
	}
	return res.status(200).json({ success: true, data: { terms: response } });
};

export { getTerms };
