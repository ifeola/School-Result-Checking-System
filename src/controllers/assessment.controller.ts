import type { Request, Response, NextFunction } from "express";
import Assessment from "../services/Assessment.ts";
import { NotFoundError } from "../services/Custom-Errors.ts";
import {
	formartPaginatedResponse,
	getPaginationParams,
} from "../utils/pagination.ts";
import type { GetStudentsQuery } from "../types/type.ts";

const getAssessment = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const studentAdmissionNumber = req.params.admission_number as string;
	const { term, session } = req.query as { term: string; session: string };

	const response = await Assessment.getByAdmissionNumber(
		studentAdmissionNumber,
		{ term, session }
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
	next: NextFunction
) => {
	const studentAdmissionNumber = req.params.admission_number as string;
	const response = await Assessment.getPreviousByAdmissionNumber(
		studentAdmissionNumber
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
	next: NextFunction
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

const getResultCounts = async (
	req: Request,
	res: Response,
	_next: NextFunction
) => {
	const sessionName = req.query.session_name as string;

	if (!sessionName) {
		return res.status(400).json({
			success: false,
			message: "session_name query parameter is required.",
		});
	}

	const rows = await Assessment.getResultCounts(sessionName);

	const counts: Record<string, number> = {};
	let totalCount = 0;
	for (const row of rows) {
		const count = parseInt(row.count, 10);
		counts[row.class_name] = count;
		totalCount += count;
	}
	counts.All = totalCount;

	res.status(200).json({ success: true, data: counts });
};

const getAllResults = async (
	req: Request<{}, {}, {}, GetStudentsQuery>,
	res: Response,
	next: NextFunction
) => {
	const { page, limit, skip } = getPaginationParams(req.query);
	const { results, totalRecords } = await Assessment.getAllResults(
		{ page, limit, skip },
		req.query
	);

	const assessments = formartPaginatedResponse(
		results,
		page,
		limit,
		totalRecords
	);

	res.status(200).json(assessments);
};

export {
	getAssessment,
	getClassPosition,
	getPreviousAssessment,
	getAllResults,
	getResultCounts,
};
