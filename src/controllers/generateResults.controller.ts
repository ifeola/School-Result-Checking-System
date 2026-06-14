import puppeteer from "puppeteer-core";
import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/type.ts";

const FRONTEND_URL = "http://localhost:5173";

const generateResult = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	const browser = await puppeteer.launch({
		executablePath: "/usr/bin/chromium-browser",
		headless: true,
	});

	try {
		const page = await browser.newPage();

		await page.goto(`http://localhost:5173/student/results/print`, {
			waitUntil: "networkidle0",
		});

		await page.waitForSelector("#result-section");

		const pdf = await page.pdf({
			format: "A4",
			printBackground: true,
		});

		res.setHeader("Content-Type", "application/pdf");
		res.setHeader("Content-Disposition", 'attachment; filename="result.pdf"');

		res.send(pdf);
	} finally {
		await browser.close();
	}
};

export default generateResult;
