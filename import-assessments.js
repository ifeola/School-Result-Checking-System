/**
 * import-assessments.js
 *
 * Imports assessments.json directly into the students_assessments table
 * using your existing db module. Upserts on conflict (same student_id +
 * academic_period_id + subject_id updates the existing row instead of
 * erroring or duplicating).
 *
 * NOTE: total_score is a GENERATED column in your schema, so it is
 * intentionally excluded from the insert — Postgres computes it automatically
 * from test_score + exam_score.
 *
 * IMPORTANT: Adjust the unique constraint name in the ON CONFLICT clause
 * below to match your actual constraint. This script assumes a unique
 * constraint/index on (student_id, academic_period_id, subject_id) — update
 * ON_CONFLICT_TARGET if your constraint is named differently or covers
 * different columns.
 *
 * Usage:
 *   node import-assessments.js assessments.json
 */

import fs from "fs/promises";
import db from "./src/database/db.ts";

// Adjust this to match your actual unique constraint on the table.
// If you have a named constraint, you can instead use:
//   ON CONFLICT ON CONSTRAINT your_constraint_name
const ON_CONFLICT_TARGET = "(student_id, academic_period_id, subject_id)";

async function importAssessments(filePath) {
	const raw = await fs.readFile(filePath, "utf-8");
	const rows = JSON.parse(raw);

	console.log(`Loaded ${rows.length} assessment rows from ${filePath}`);
	console.log("Starting single transaction for the whole batch...\n");

	const client = await db.sql.connect();
	let upserted = 0;

	try {
		await client.query("BEGIN");

		const query = `
      INSERT INTO students_assessments (
        student_id,
        academic_period_id,
        subject_id,
        test_score,
        exam_score,
        grade,
        remark
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT ${ON_CONFLICT_TARGET}
      DO UPDATE SET
        test_score = EXCLUDED.test_score,
        exam_score = EXCLUDED.exam_score,
        grade = EXCLUDED.grade,
        remark = EXCLUDED.remark
      RETURNING id, student_id, subject_id, total_score;
    `;

		for (let i = 0; i < rows.length; i++) {
			const row = rows[i];
			const label = `[${i + 1}/${rows.length}] student ${
				row.student_id
			} / subject ${row.subject_id}`;

			const values = [
				row.student_id,
				row.academic_period_id,
				row.subject_id,
				row.test_score,
				row.exam_score,
				row.grade,
				row.remark ?? null,
			];

			const result = await client.query(query, values);
			const saved = result.rows[0];
			upserted++;
			console.log(
				`✅ ${label} -> total_score computed as ${saved.total_score}`
			);
		}

		await client.query("COMMIT");
		console.log(`\n🎉 Success. ${upserted} assessment rows upserted.`);
	} catch (error) {
		await client.query("ROLLBACK");
		console.error(`\n❌ Import failed, entire batch rolled back.`);
		console.error(error.message || error);
		process.exitCode = 1;
	} finally {
		client.release();
	}
}

const fileArg = process.argv[2];
if (!fileArg) {
	console.error("Usage: node import-assessments.js <path-to-assessments.json>");
	process.exit(1);
}

importAssessments(fileArg);
