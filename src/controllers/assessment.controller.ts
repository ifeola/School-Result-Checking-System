import type { Request, Response, NextFunction } from "express";
import Assessment from "../services/Assessment.ts";
import { NotFoundError } from "../services/Custom-Errors.ts";

const getAssessment = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const studentId = req.params.id as string;
	try {
		const response = await Assessment.getById(studentId);

		if (response.length === 0) {
			return next(new NotFoundError("No result found for student."));
		}

		return res.status(200).json({
			success: true,
			message: "Results successfully fetched.",
			data: { results: response },
		});
	} catch (error) {
		next(error);
	}
};

export { getAssessment };
