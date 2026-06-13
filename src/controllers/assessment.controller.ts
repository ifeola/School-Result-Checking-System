import type { Request, Response, NextFunction } from "express";
import Assessment from "../services/Assessment.ts";
import { NotFoundError } from "../services/Custom-Errors.ts";
import generateResultPDF from "../utils/generateResult.ts";
import { fileURLToPath } from "url";
import path from "path";

const getAssessment = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const studentAdmissionNumber = req.params.admission_number as string;
	try {
		const response = await Assessment.getByAdmissionNumber(
			studentAdmissionNumber,
		);

		if (response.length === 0) {
			return next(new NotFoundError("No result found for student."));
		}

		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);
		generateResultPDF(__dirname, response);

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
