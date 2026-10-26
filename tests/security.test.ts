import { randomUUID } from "node:crypto";
import path from "node:path";
import bcrypt from "bcrypt";
import ejs from "ejs";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import db from "../src/database/db.ts";
import Student from "../src/services/Students.ts";
import User from "../src/services/User.ts";
import Admin from "../src/services/Admin.ts";
import { createTestApp, signToken } from "./helpers.ts";

const VALIDATION_MESSAGE = "Too many requests. Please try again later.";

describe("rate limiting", () => {
	it("returns 429 with RateLimit headers after the global limit", async () => {
		const app = createTestApp({
			RATE_LIMIT_MAX: "2",
			RATE_LIMIT_WINDOW_MS: "60000",
		});

		await request(app).get("/api/v1/students").expect(401);
		await request(app).get("/api/v1/students").expect(401);

		const response = await request(app).get("/api/v1/students");

		expect(response.status).toBe(429);
		expect(response.body).toEqual({
			success: false,
			message: VALIDATION_MESSAGE,
		});
		expect(response.headers["ratelimit"]).toBeDefined();
		expect(response.headers["retry-after"]).toBeDefined();
	});

	it("returns 429 after the stricter login limit", async () => {
		const app = createTestApp({
			AUTH_RATE_LIMIT_MAX: "2",
			LOGIN_SLOWDOWN_ENABLED: "false",
		});

		await request(app)
			.post("/api/v1/auth/login")
			.send({})
			.expect(400);
		await request(app)
			.post("/api/v1/auth/login")
			.send({})
			.expect(400);

		const response = await request(app)
			.post("/api/v1/auth/login")
			.send({});

		expect(response.status).toBe(429);
		expect(response.body.message).toBe(VALIDATION_MESSAGE);
	});
});

describe("input validation and SQL injection", () => {
	it("rejects invalid login bodies", async () => {
		const app = createTestApp();

		const response = await request(app)
			.post("/api/v1/auth/login")
			.send({ identifier: "not-an-identifier" });

		expect(response.status).toBe(400);
		expect(response.body.success).toBe(false);
	});

	it("rejects invalid UUID route params", async () => {
		const app = createTestApp();
		const token = signToken("staff_admin");

		const response = await request(app)
			.get("/api/v1/students/not-a-uuid")
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(400);
	});

	it("rejects out-of-range pagination", async () => {
		const app = createTestApp();
		const token = signToken("staff_admin");
		const querySpy = vi.spyOn(db, "query");

		const response = await request(app)
			.get("/api/v1/students?limit=5000")
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(400);
		expect(querySpy).not.toHaveBeenCalled();
	});

	it("routes /students/results to the staff results handler", async () => {
		const app = createTestApp();
		const token = signToken("staff_admin");

		vi.spyOn(db, "query").mockResolvedValue({
			rows: [{ count: "0" }],
			rowCount: 1,
		} as never);

		const response = await request(app)
			.get("/api/v1/students/results")
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(200);
	});

	it("rejects SQL-injection-style update keys before the database", async () => {
		const app = createTestApp();
		const token = signToken("staff_admin");
		const querySpy = vi.spyOn(db, "query");

		const response = await request(app)
			.patch(`/api/v1/students/${randomUUID()}`)
			.set("Authorization", `Bearer ${token}`)
			.send({
				"first_name = 'x'; DROP TABLE students; --": "value",
			});

		expect(response.status).toBe(400);
		expect(querySpy).not.toHaveBeenCalled();
	});

	it("only parameterizes whitelisted update columns", async () => {
		const id = randomUUID();
		const querySpy = vi.spyOn(db, "query").mockResolvedValue({
			rows: [{ id }],
			rowCount: 1,
		} as never);

		await Student.updateStudent(id, { first_name: "Ada" });

		const [sql, values] = querySpy.mock.calls[0] as [
			string,
			unknown[],
		];

		expect(sql).toContain("first_name = $1");
		expect(sql).not.toContain("Ada");
		expect(values).toEqual(["Ada", id]);
	});

	it("rejects malicious column names at the service layer", async () => {
		const querySpy = vi.spyOn(db, "query");

		await expect(
			Student.updateStudent(randomUUID(), {
				"first_name = 'x'": "value",
			} as never),
		).rejects.toThrow("Invalid update field");

		expect(querySpy).not.toHaveBeenCalled();
	});

	it("parameterizes free-text search values", async () => {
		const maliciousSearch = "' OR 1=1 --";
		const querySpy = vi.spyOn(db, "query").mockResolvedValue({
			rows: [{ count: "0" }],
			rowCount: 1,
		} as never);

		await Student.getAllStudents(
			{ page: 1, limit: 25, skip: 0 },
			{ search: maliciousSearch },
		);

		for (const [sql, params] of querySpy.mock.calls) {
			expect(String(sql)).not.toContain(maliciousSearch);
			expect(params).toContain(`%${maliciousSearch}%`);
		}
	});
});

describe("authentication and authorization", () => {
	it("returns 401 without a token", async () => {
		const app = createTestApp();

		const response = await request(app).get("/api/v1/auth/me");

		expect(response.status).toBe(401);
		expect(response.body).toEqual({
			success: false,
			message: "Authentication failed, please try again.",
		});
	});

	it("returns a profile for a super_admin", async () => {
		const app = createTestApp();
		const token = signToken("super_admin");

		vi.spyOn(Admin, "getAdminById").mockResolvedValueOnce({
			id: randomUUID(),
			user_id: "super-admin-user-id",
			role: "super_admin",
		} as never);

		const response = await request(app)
			.get("/api/v1/auth/me")
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(200);
		expect(response.body.data.user.role).toBe("super_admin");
	});

	it("returns 403 when a student calls an admin-only route", async () => {
		const app = createTestApp();
		const token = signToken("student");

		const response = await request(app)
			.post("/api/v1/admins")
			.set("Authorization", `Bearer ${token}`)
			.send({});

		expect(response.status).toBe(403);
	});

	it("returns 403 when a student lists all students", async () => {
		const app = createTestApp();
		const token = signToken("student");

		const response = await request(app)
			.get("/api/v1/students")
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(403);
	});

	it("returns the same 401 for an unknown user and a wrong password", async () => {
		const app = createTestApp();
		const userSpy = vi.spyOn(User, "getUserByIdentifier");

		userSpy.mockResolvedValueOnce(undefined);
		const unknownUser = await request(app)
			.post("/api/v1/auth/login")
			.send({
				identifier: "unknown@example.com",
				password: "wrong-password",
			});

		const passwordHash = await bcrypt.hash("correct-password", 4);
		userSpy.mockResolvedValueOnce({
			id: randomUUID(),
			email: "known@example.com",
			password_hash: passwordHash,
			role: "student",
			id_number: "DEAC-2024-0001",
		});
		const wrongPassword = await request(app)
			.post("/api/v1/auth/login")
			.send({
				identifier: "known@example.com",
				password: "wrong-password",
			});

		expect(unknownUser.status).toBe(401);
		expect(wrongPassword.status).toBe(401);
		expect(unknownUser.body).toEqual(wrongPassword.body);
		expect(unknownUser.body.message).toBe(
			"Invalid username or password.",
		);
	});

	it("sets an httpOnly, sameSite cookie on successful login", async () => {
		const app = createTestApp();
		const passwordHash = await bcrypt.hash("correct-password", 4);

		vi.spyOn(User, "getUserByIdentifier").mockResolvedValueOnce({
			id: randomUUID(),
			email: "known@example.com",
			password_hash: passwordHash,
			role: "student",
			id_number: "DEAC-2024-0001",
		});

		const response = await request(app)
			.post("/api/v1/auth/login")
			.send({
				identifier: "known@example.com",
				password: "correct-password",
			});

		const cookies = response.headers["set-cookie"];
		const cookieHeader = Array.isArray(cookies)
			? cookies.join(";")
			: String(cookies ?? "");

		expect(response.status).toBe(200);
		expect(cookieHeader).toMatch(/HttpOnly/i);
		expect(cookieHeader).toMatch(/SameSite=Lax/i);
		expect(response.body.data.user.password_hash).toBeUndefined();
	});

	it("prevents a student from reading another student's results", async () => {
		const app = createTestApp();
		const token = signToken("student", "student-user-id");

		vi.spyOn(Student, "getStudentById").mockResolvedValueOnce({
			admission_number: "DEAC-2024-0001",
			user_id: "student-user-id",
		} as never);

		const response = await request(app)
			.get("/api/v1/students/DEAC-2024-0002/results")
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(403);
	});

	it("prevents a student from downloading another student's PDF", async () => {
		const app = createTestApp();
		const token = signToken("student", "student-user-id");

		vi.spyOn(Student, "getStudentById").mockResolvedValueOnce({
			user_id: "another-user-id",
			admission_number: "DEAC-2024-0002",
		} as never);

		const response = await request(app)
			.get(`/api/v1/result/${randomUUID()}/pdf`)
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(403);
	});
});

describe("CORS and request hardening", () => {
	it("blocks a disallowed origin", async () => {
		const app = createTestApp();

		const response = await request(app)
			.options("/api/v1/students")
			.set("Origin", "https://evil.example")
			.set("Access-Control-Request-Method", "GET");

		expect(response.status).toBe(403);
		expect(
			response.headers["access-control-allow-origin"],
		).toBeUndefined();
	});

	it("allows the configured Vite origin with credentials", async () => {
		const app = createTestApp();

		const response = await request(app)
			.options("/api/v1/students")
			.set("Origin", "http://localhost:5173")
			.set("Access-Control-Request-Method", "GET");

		expect(response.status).toBe(204);
		expect(response.headers["access-control-allow-origin"]).toBe(
			"http://localhost:5173",
		);
		expect(response.headers["access-control-allow-credentials"]).toBe(
			"true",
		);
	});

	it("rejects oversized JSON payloads with 413", async () => {
		const app = createTestApp();

		const response = await request(app)
			.post("/api/v1/auth/login")
			.set("Content-Type", "application/json")
			.send(JSON.stringify({ data: "a".repeat(200_000) }));

		expect(response.status).toBe(413);
		expect(response.body).toEqual({
			success: false,
			message: "Request payload is too large.",
		});
	});

	it("rejects malformed JSON with 400", async () => {
		const app = createTestApp();

		const response = await request(app)
			.post("/api/v1/auth/login")
			.set("Content-Type", "application/json")
			.send('{"identifier":');

		expect(response.status).toBe(400);
		expect(response.body.message).toBe("Invalid JSON payload.");
	});

	it("exposes an unauthenticated liveness probe", async () => {
		const app = createTestApp();

		const response = await request(app).get("/health");

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ status: "ok" });
		expect(response.headers["cache-control"]).toBe("no-store");
	});

	it("removes x-powered-by and sets security headers", async () => {
		const app = createTestApp();

		const response = await request(app).get("/api/v1/students");

		expect(response.headers["x-powered-by"]).toBeUndefined();
		expect(response.headers["x-content-type-options"]).toBe("nosniff");
		expect(response.headers["content-security-policy"]).toBeDefined();
		expect(response.headers["cache-control"]).toBe("no-store");
	});
});

describe("PDF template escaping", () => {
	it("escapes student names and remarks in the report card", async () => {
		const html = await ejs.renderFile(
			path.join(process.cwd(), "src/views/reportCard.ejs"),
			{
				student: {
					first_name: "<script>alert(1)</script>",
					last_name: "Doe",
					admission_number: "DEAC-2024-0001",
					gender: "male",
				},
				results: [
					{
						term_name: "First Term",
						session_name: "2024/2025",
						class_name: "JSS1",
						subject_name: "Mathematics",
						test_score: 10,
						exam_score: 20,
						total_score: 30,
						grade: "C",
						remark: "<img src=x onerror=alert(1)>",
					},
				],
				position: { position: 1 },
				totalScore: 30,
				averageScore: "30.00",
				school: {
					name: "Delight Academy",
					address: "Ibadan",
					phone: "000",
					email: "school@example.com",
					website: "example.com",
					motto: "Motto",
				},
			},
		);

		expect(html).not.toContain("<script>alert(1)</script>");
		expect(html).not.toContain("<img src=x onerror=alert(1)>");
		expect(html).toContain("&lt;script&gt;");
		expect(html).toContain("&lt;img");
	});
});
