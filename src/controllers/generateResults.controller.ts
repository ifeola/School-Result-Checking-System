import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/type.ts";
// import puppeteer from "puppeteer";

const html = `

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Academic Result - Delight Academy</title>
    <style>

			/* Reset and Base Styles */
			* {
					margin: 0;
					padding: 0;
					box-sizing: border-box;
			}

			body {
					font-family: Arial, sans-serif;
					background-color: #f3f4f6;
					display: flex;
					justify-content: center;
					padding: 2rem;
			}

			/* Result Container */
			.result-container {
					background-color: white;
					padding: 3rem 5rem;
					box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
					border: 1px solid #e5e7eb;
					max-width: 900px;
					width: 100%;
			}

			/* Header Section */
			.header {
					text-align: center;
			}

			.school-name {
					font-weight: bold;
					font-size: 2.25rem;
					text-transform: uppercase;
					text-align: center;
					color: #1f2937;
			}

			.school-address {
					font-size: 0.875rem;
					text-align: center;
					color: #4b5563;
					margin-top: 0.25rem;
			}

			.school-contact {
					font-size: 0.875rem;
					text-align: center;
					color: #4b5563;
			}

			.school-website {
					margin-left: 0.25rem;
					text-decoration: underline;
					color: #3b82f6;
			}

			.divider-container {
					margin-top: 0.25rem;
			}

			.divider {
					width: 100%;
					height: 1px;
					background-color: #dbeafe;
					margin-top: 0.125rem;
			}

			/* Result Title */
			.result-title-wrapper {
					margin-top: 0.75rem;
					margin-bottom: 1.5rem;
					display: flex;
					align-items: center;
					justify-content: center;
			}

			.result-title {
					border: 1px solid #9ca3af;
					background-color: rgba(59, 130, 246, 0.3);
					padding: 0.25rem 1rem;
					line-height: 1rem;
					color: black;
					text-transform: uppercase;
					width: fit-content;
					font-weight: bold;
					font-size: 1.125rem;
			}

			/* Result Content */
			.result-content {
					font-family: 'Courier New', monospace;
			}

			/* Student Info */
			.student-info {
					font-size: 0.875rem;
					text-transform: uppercase;
			}

			.info-box {
					margin-bottom: 0.25rem;
					color: #374151;
			}

			.info-box strong {
					text-transform: capitalize;
					color: #1f2937;
			}

			/* Results Table */
			.results-table {
					width: 100%;
					margin-top: 2rem;
					border: 2px solid #e5e7eb;
					border-collapse: separate;
					border-spacing: 0;
			}

			.results-table thead {
					background-color: #f3f4f6;
					font-weight: 600;
					font-size: 0.875rem;
					text-transform: uppercase;
			}

			.results-table th {
					padding: 0.5rem 0.5rem;
					border: 1px solid #dbeafe;
					text-align: right;
			}

			.results-table th:first-child {
					text-align: left;
			}

			.results-table tbody {
					font-size: 0.875rem;
					text-transform: uppercase;
			}

			.results-table td {
					padding: 0.5rem 0.5rem;
					border: 1px solid #dbeafe;
			}

			.results-table tr:nth-child(even) {
					background-color: #f3f4f6;
			}

			.text-right {
					text-align: right;
			}

			/* Summary Section */
			.summary-section {
					display: flex;
					justify-content: flex-end;
					margin-top: 0.5rem;
					text-transform: uppercase;
					font-size: 0.875rem;
					gap: 2.5rem;
					margin-bottom: 2rem;
			}

			.summary-section strong {
					font-weight: bold;
			}

			/* Remarks Section */
			.remarks-section {
					display: flex;
					flex-direction: column;
					align-items: flex-start;
					padding: 0.5rem;
					gap: 0.5rem;
					font-size: 0.875rem;
			}

			.remark-box {
					border: 1px solid #e5e7eb;
					padding: 0.5rem;
					text-transform: uppercase;
			}

			.remark-box strong {
					font-weight: bold;
			}

			/* Signature Section */
			.signature-section {
					display: flex;
					align-items: center;
					justify-content: space-between;
					margin-top: 8rem;
			}

			.signature {
					width: 50%;
					display: flex;
					flex-direction: column;
					align-items: center;
					text-transform: uppercase;
					font-size: 0.875rem;
			}

			.signature-line {
					width: 50%;
					height: 1px;
					background-color: black;
					margin-bottom: 0.25rem;
			}

			/* Utility Classes */
			.capitalize {
					text-transform: capitalize;
			}
		</style>
</head>
<body>
    <div class="result-container">
        <div class="header">
            <div>
                <h2 class="school-name">Delight Academy</h2>
                <p class="school-address">No 1 Road 10, Bethel Estate, Gloryland Mayfair, Ibadan.</p>
                <p class="school-contact">
                    Email: adminoffice@delightacademy.edu.ng - Website:
                    <a href="http://www.delightacademy.edu.ng" class="school-website">www.delightacademy.edu.ng</a>
                </p>
            </div>

            <div class="divider-container">
                <div class="divider"></div>
                <div class="divider"></div>
            </div>

            <div class="result-title-wrapper">
                <h4 class="result-title">STUDENT ACADEMIC RESULT</h4>
            </div>
        </div>

        <div class="result-content">
            <div class="student-info">
                <div class="info-box">
                    Name: <strong class="capitalize">John Michael Doe</strong>
                </div>

                <div class="info-box">
                    Admission No: <strong>ADM2024001</strong>
                </div>

                <div class="info-box">
                    Class: <strong>Primary 5</strong>
                </div>

                <div class="info-box">
                    Term: <strong class="capitalize">First Term</strong>
                </div>

                <div class="info-box">
                    Session: <strong class="capitalize">2024/2025</strong>
                </div>
            </div>

            <table class="results-table">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Test</th>
                        <th>Assignment</th>
                        <th>Exam</th>
                        <th>Total</th>
                        <th>Grade</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Mathematics</td>
                        <td class="text-right">18</td>
                        <td class="text-right">9</td>
                        <td class="text-right">55</td>
                        <td class="text-right">82</td>
                        <td class="text-right">A</td>
                    </tr>
                    <tr>
                        <td>English Language</td>
                        <td class="text-right">16</td>
                        <td class="text-right">8</td>
                        <td class="text-right">50</td>
                        <td class="text-right">74</td>
                        <td class="text-right">B</td>
                    </tr>
                    <tr>
                        <td>Basic Science</td>
                        <td class="text-right">19</td>
                        <td class="text-right">10</td>
                        <td class="text-right">58</td>
                        <td class="text-right">87</td>
                        <td class="text-right">A</td>
                    </tr>
                    <tr>
                        <td>Social Studies</td>
                        <td class="text-right">15</td>
                        <td class="text-right">7</td>
                        <td class="text-right">48</td>
                        <td class="text-right">70</td>
                        <td class="text-right">B</td>
                    </tr>
                    <tr>
                        <td>Christian Religious Studies</td>
                        <td class="text-right">20</td>
                        <td class="text-right">10</td>
                        <td class="text-right">60</td>
                        <td class="text-right">90</td>
                        <td class="text-right">A</td>
                    </tr>
                </tbody>
            </table>

            <div class="summary-section">
                <p>Grand Total: <strong>403</strong></p>
                <p>Average: <strong>80.6</strong></p>
            </div>

            <div class="remarks-section">
                <p class="remark-box">
                    Teacher's Remark: <strong>Excellent Performance</strong>
                </p>
                <p class="remark-box">
                    Principal's Remark: <strong>Keep up the good work</strong>
                </p>
            </div>

            <div class="signature-section">
                <div class="signature">
                    <div class="signature-line"></div>
                    Class Teacher
                </div>
                <div class="signature">
                    <div class="signature-line"></div>
                    Principal
                </div>
            </div>
        </div>
    </div>
</body>
</html>

`;

const generateResult = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	let browser;

	try {
		browser = await puppeteer.launch({
			headless: "new",
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});
		const page = await browser.newPage();
		await page.setContent(html, { waitUntil: "networkidle0" });

		const pdfBuffer = await page.pdf({
			format: "A4",
			printBackground: true,
			margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
		});

		res.set({
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="result-${req.params.studentId}.pdf"`,
			"Content-Length": pdfBuffer.length,
		});
		res.send(pdfBuffer);
	} catch (error) {
		console.log(error);
	} finally {
		if (browser) {
			await browser.close();
		}
	}
};

// export default generateResult;
