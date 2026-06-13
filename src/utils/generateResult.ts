import path from "path";
import puppeteer from "puppeteer-core";

interface Result {
	first_name: string;
	last_name: string;
	middle_name: string;
	admission_number: string;
	class_name: string;
	term_name: string;
	session_name: string;
	subject_name: string;
	assignment_score: string;
	test_score: string;
	exam_score: string;
	total_score: string;
	grade: string;
	remark: string;
}

async function generateResultPDF(dirname: string, results: Result[]) {
	const grandTotal = results?.reduce(
		(sum, subject) => sum + Number(subject.total_score),
		0,
	);

	const average = (grandTotal / results.length).toFixed(2);

	const rows = results
		.map(
			(result) => `
      <tr>
        <td>${result.subject_name}</td>
        <td>${Number(result.test_score).toFixed(2)}</td>
        <td>${Number(result.assignment_score).toFixed(2)}</td>
        <td>${Number(result.exam_score).toFixed(2)}</td>
        <td>${Number(result.total_score).toFixed(2)}</td>
        <td>${result.grade}</td>
      </tr>
    `,
		)
		.join("");

	const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Student Result</title>

    <style>
      @import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");
      @import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap");
      * {
        box-sizing: border-box;
      }

      body {
        font-family: Inter, sans-serif;
        padding: 30px;
      }

      .header {
        text-align: center;
        margin-bottom: 20px;
      }

      .school-name {
        font-size: 36px;
        font-weight: bold;
        text-transform: uppercase;
        text-align: center;
      }

      .address, .link {
        font-size: 14px;
        text-align: center;
      }

      .line-parent {
        margin-top: 0.25rem;

        .line {
          width: 100%;
          height: 1px;
          background-color: oklch(70.7% 0.022 261.325);
          margin-top: 0.125rem;
        }
      }

      .report-title {
        margin-top: 12px;
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: "IBM Plex Mono", monospace;
      }

      .info {
        font-family: "IBM Plex Mono", monospace;
      }

      .student-info {
        font-size: 14px;
        text-transform: uppercase;
      }

      .capitalize {
        text-transform: capitalize;
      }

      table {
        width: 100%;
        border-collapse: separate;
        border-width: 2px;
        border-color: oklch(96.7% 0.003 264.542);
        margin-top: 32px;
        table-layour: auto;
      }

      thead {
        background-color: oklch(96.7% 0.003 264.542);
        font-weight: 600;
        font-size: 14px;
        text-transform: uppercase;
      }

      thead tr {
        text-align: right;
      }

      th {
        padding-inline: 8px;
        padding-block: 4px;
         border-width: 1px;
        border-color: oklch(92.8% 0.006 264.531);
        text-align: left;
      }
      
      th:first-child {
        text-align: left;
      }

      tbody {
        font-size: 14px;
        text-transform: uppercase;

        &:nth-child(even) {
          background-color:  oklch(96.7% 0.003 264.542);
        }

        td {
          text-align: right;
          padding-inline: 8px;
          padding-block: 4px;
          border-width: 1px;
          border-color: oklch(92.8% 0.006 264.531);
        }
      }

      .summary {
        display: flex;
        justify-content: end;
        margin-top: 8px;
        text-transform: uppercase;
        font-size: 14px;
        gap: 40px;
        margin-bottom: 32px;
      }

      .remarks {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 8px;
        gap: 8px;
        font-size: 14px;

        .remark {
          border-width: 1px;
          border-color: oklch(92.8% 0.006 264.531);
          padding: 8px;
        }

        strong {
          text-transform: uppercase;
        }
      }
      
      .signature-section {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 128px;
      }

      .signature-box {
        width: calc(1 / 2 * 100%);
        display: flex;
        align-items: center;
        flex-direction: column;

        .line {
          width: calc(1 / 2 * 100%);
          height: 1px;
          background-color: #000000;
        }
      }

      
    </style>
  </head>

  <body>

    <div class="header">
     <div>
							<h2 className="school_name">
								Delight Academy
							</h2>
							<p className="address">
								No 1 Road 10, Bethel Estate, Gloryland Mayfair, Ibadan.
							</p>
							<p className="link">
								Email: adminoffice@delightacademy.edu.ng - Website:
								<a
									href="http://www.delightacademy.edu.ng"
									className="ml-1 underline text-primary">
									www.delightacademy.edu.ng
								</a>
							</p>
						</div>

     <div className="line-parent">
							<div className="line"></div>
							<div className="line"></div>
						</div>

						<div className="report-title">
							<h4>
								STUDENT ACADEMIC RESULT
							</h4>
						</div>
    </div>

    <div className="info">
						<div className="student-info">
							<div className="info-box">
								Name:{" "}
								<strong className="capitalize">
									${results[0]?.first_name}${" "}{results[0]?.middle_name}${" "}
									${results[0]?.last_name}
								</strong>
							</div>

							<div className="info-box">
								Admission No:${" "}<strong>${results[0]?.admission_number}</strong>
							</div>

							<div className="info-box">
								Class: <strong>${results[0]?.class_name}</strong>
							</div>

							<div className="info-box">
								Term:${" "}
							  <strong className="capitalize">${results[0]?.term_name}</strong>
							</div>

							<div className="info-box">
								Session:${" "}
								<strong className="capitalize">
									${results[0]?.session_name}
								</strong>
							</div>
						</div>

						<table>
							<thead>
								<tr>
									<th>
										Subject
									</th>
									<th>Test</th>
									<th>
										Assignment
									</th>
									<th>Exam</th>
									<th>Total</th>
									<th>Grade</th>
								</tr>
							</thead>

							<tbody className="text-sm uppercase">
              ${rows}
							</tbody>
						</table>

						<div className="summary">
							<p>
								Grand Total: <strong>${grandTotal}</strong>
							</p>
							<p>
								Average: <strong>${average}</strong>
							</p>
						</div>

						<div className="remarks">
							<p className="remark">
								Teacher's Remark:${" "}
								<strong className="uppercase">Excellent Performance</strong>
							</p>

							<p className="remark">
								Principal's Remark:${" "}
								<strong className="uppercase">Keep up the good work</strong>
							</p>
						</div>

						<div className="signature-section">
							<div className="signature-box">
								<div className="line"></div>
								Class Teacher
							</div>

							<div className="signature-box">
								<div className="line"></div>
								Principal
							</div>
						</div>
					</div>

  </body>
  </html>
  `;

	const browser = await puppeteer.launch({
		executablePath: "/usr/bin/chromium-browser", // or the path from `which`
		headless: true,
		args: ["--no-sandbox"],
	});

	const page = await browser.newPage();

	await page.setContent(html);

	const filename = `${results[0]?.first_name as string}_${results[0]?.last_name as string}.pdf`;
	await page.pdf({
		path: path.join(dirname, "../public", filename),
		format: "A4",
		printBackground: true,
	});

	await browser.close();
}

export default generateResultPDF;
