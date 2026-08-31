import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/type.ts";
import puppeteer, { Browser } from "puppeteer";
import ejs from "ejs";
import fs from "fs";
import path from "path";
import Student from "../services/Students.ts";
import { Session } from "../services/Props.ts";
import Assessment from "../services/Assessment.ts";
import { school } from "../constants/school.ts";

let browserInstance: Browser | null = null;

const getBrowser = async (): Promise<Browser> => {
	if (!browserInstance || !browserInstance.connected) {
		browserInstance = await puppeteer.launch({
			headless: true,
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
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

const generateResult = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	let browser;
	const params = req.params;

	try {
		browser = await getBrowser();
		const page = await browser.newPage();

		const student = await Student.getStudentById(params.id as string);
		const results = await Assessment.getCurrentByAdmissionNumber(
			student.admission_number,
			{ term: "third", session: "2025/2026" }
		);
		const position = await Assessment.getCurrentPosition(
			student.admission_number
		);

		const totalScore = results.reduce(
			(acc, current) => acc + current.total_score,
			0
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
			}
		);

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

		res.set({
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="result-${student.last_name}-${student.first_name}.pdf"`,
			"Content-Length": pdfBuffer.length,
		});
		res.send(pdfBuffer);
	} catch (error) {
		console.log(error);
	} finally {
		if (browser) {
			await closeBrowser();
		}
	}
};

export default generateResult;
