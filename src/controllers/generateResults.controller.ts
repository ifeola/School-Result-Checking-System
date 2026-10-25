import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/type.ts";
import puppeteer, { type Browser, type Page } from "puppeteer";
import ejs from "ejs";
import path from "path";
import Student from "../services/Students.ts";
import Assessment from "../services/Assessment.ts";
import { school } from "../constants/school.ts";
import { NotFoundError } from "../services/Custom-Errors.ts";
import { assertStudentRecordAccess } from "../middlewares/studentAccess.ts";
import { loadEnv } from "../config/env.ts";

const env = loadEnv();
let browserInstance: Browser | null = null;

const getBrowser = async (): Promise<Browser> => {
	if (!browserInstance || !browserInstance.connected) {
		browserInstance = await puppeteer.launch({
			// The headless shell is sufficient for static PDF rendering and is
			// considerably lighter than a full Chrome installation.
			headless: "shell",
			args: env.puppeteer.noSandbox
				? ["--no-sandbox", "--disable-setuid-sandbox"]
				: [],
		});
	}
	return browserInstance;
};

export async function closeBrowser(): Promise<void> {
	if (browserInstance) {
		await browserInstance.close();
		browserInstance = null;
	}
}

const safeFilenamePart = (value: string): string =>
	value
		.normalize("NFKD")
		.replace(/[^A-Za-z0-9_-]+/g, "_")
		.replace(/^_+|_+$/g, "")
		.slice(0, 80) || "student";

const generateResult = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	let page: Page | undefined;

	try {
		const studentId = req.params.id as string;
		const query = req.query as {
			term?: string;
			session?: string;
			term_name?: string;
			session_name?: string;
		};
		const term = query.term_name ?? query.term;
		const session = query.session_name ?? query.session;

		const student = await Student.getStudentById(studentId);
		if (!student) {
			return next(new NotFoundError("Student not found."));
		}

		assertStudentRecordAccess(req.user, student);

		const results = await Assessment.getByAdmissionNumber(
			student.admission_number,
			{ term: term ?? "", session: session ?? "" },
		);

		if (results.length === 0) {
			return next(new NotFoundError("No result found for student."));
		}

		const position = await Assessment.getCurrentPosition(
			student.admission_number,
		);

		const totalScore = results.reduce(
			(acc, current) => acc + current.total_score,
			0,
		);
		const averageScore = (totalScore / results.length).toFixed(2);

		const __dirname = import.meta.dirname;
		const html = await ejs.renderFile(
			path.join(__dirname, "../views/reportCard.ejs"),
			{
				student,
				results,
				position,
				totalScore,
				averageScore,
				school,
			},
		);

		const browser = await getBrowser();
		page = await browser.newPage();
		// The report card is static HTML; scripts are never needed. Disabling
		// JavaScript removes an entire XSS-to-PDF execution path.
		await page.setJavaScriptEnabled(false);
		await page.setContent(html, { waitUntil: "domcontentloaded" });

		const pdfBuffer = await page.pdf({
			format: "A4",
			printBackground: true,
			margin: {
				top: "15mm",
				bottom: "20mm",
				left: "15mm",
				right: "15mm",
			},
		});

		const filename = `result-${safeFilenamePart(
			student.last_name,
		)}-${safeFilenamePart(student.first_name)}.pdf`;

		res.set({
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="${filename}"`,
			"Content-Length": pdfBuffer.length.toString(),
		});
		return res.send(pdfBuffer);
	} catch (error) {
		return next(error);
	} finally {
		if (page) {
			await page.close().catch(() => undefined);
		}
	}
};

export default generateResult;
