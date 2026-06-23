import type { Request, Response, NextFunction } from "express";
import Assessment from "../services/Assessment.ts";
import { NotFoundError } from "../services/Custom-Errors.ts";

const getAssessment = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const studentAdmissionNumber = req.params.admission_number as string;
	const { term, session } = req.query as { term: string; session: string };

	const response = await Assessment.getCurrentByAdmissionNumber(
		studentAdmissionNumber,
		{ term, session },
	);

	if (response.length === 0) {
		return next(new NotFoundError("No result found for student."));
	}

	return res.status(200).json({
		success: true,
		message: "Results successfully fetched.",
		data: { results: response },
	});
};

const getPreviousAssessment = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const studentAdmissionNumber = req.params.admission_number as string;
	const response = await Assessment.getPreviousByAdmissionNumber(
		studentAdmissionNumber,
	);

	if (response.length === 0) {
		return next(new NotFoundError("No result found for student."));
	}

	return res.status(200).json({
		success: true,
		message: "Results successfully fetched.",
		data: { results: response },
	});
};

const getClassPosition = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const studentAdmissionNumber = req.params.admission_number as string;
	const response = await Assessment.getCurrentPosition(studentAdmissionNumber);

	if (response.length === 0) {
		return next(new NotFoundError("No result found for student."));
	}

	return res.status(200).json({
		success: true,
		message: "Position successfully fetched.",
		data: { position: response },
	});
};

export { getAssessment, getClassPosition, getPreviousAssessment };
