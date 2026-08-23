/**
 * migrate-students.mjs
 *
 * Migrates the generated students.json array into the database by hitting
 * the live POST /api/v1/students endpoint for each student, sequentially.
 *
 * Usage:
 *   node migrate-students.mjs
 *
 * Requires Node 18+ (for built-in fetch). No extra deps needed.
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- Config ----
const BASE_URL = "http://localhost:8080";
const ENDPOINT = "/api/v1/students";
const STUDENTS_FILE = path.join(__dirname, "students.json");
const DELAY_MS_BETWEEN_REQUESTS = 50; // small delay to avoid hammering the DB pool

// ---- Helpers ----
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function postStudent(student) {
  const res = await fetch(`${BASE_URL}${ENDPOINT}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  });

  let body;
  try {
    body = await res.json();
  } catch {
    body = { raw: await res.text().catch(() => "") };
  }

  if (!res.ok) {
    const err = new Error(
      `HTTP ${res.status} — ${body?.message || JSON.stringify(body)}`
    );
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}

async function main() {
  const raw = await fs.readFile(STUDENTS_FILE, "utf-8");
  const students = JSON.parse(raw);

  console.log(`Loaded ${students.length} students from ${STUDENTS_FILE}`);
  console.log(`Posting to ${BASE_URL}${ENDPOINT}\n`);

  const results = {
    succeeded: [],
    failed: [],
  };

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const label = `[${i + 1}/${students.length}] ${student.first_name} ${student.last_name}`;

    try {
      const response = await postStudent(student);
      const admissionNumber =
        response?.data?.admissionNumber ??
        response?.data?.admission_number ??
        "unknown";
      console.log(`✅ ${label} -> admission #${admissionNumber}`);
      results.succeeded.push({ input: student, response });
    } catch (error) {
      console.error(`❌ ${label} -> ${error.message}`);
      results.failed.push({ input: student, error: error.message });
    }

    if (DELAY_MS_BETWEEN_REQUESTS > 0) {
      await sleep(DELAY_MS_BETWEEN_REQUESTS);
    }
  }

  console.log(`\nDone. ${results.succeeded.length} succeeded, ${results.failed.length} failed.`);

  if (results.failed.length > 0) {
    const failLogPath = path.join(__dirname, "migration-failures.json");
    await fs.writeFile(failLogPath, JSON.stringify(results.failed, null, 2));
    console.log(`Failure details written to ${failLogPath}`);
  }
}

main().catch((err) => {
  console.error("Fatal error running migration:", err);
  process.exit(1);
});
