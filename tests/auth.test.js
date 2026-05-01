const request = require("supertest");
const app = require("../index");
const { prismaMock } = require("./setup");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

describe("Auth System Validation", () => {
    it("should reject signup with missing fields", async () => {
        const res = await request(app).post("/auth/register").send({ email: "test@test.com" });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.msg).toBe("Validation error");
    });

    it("should successfully signup a new user", async () => {
        prismaMock.user.findUnique.mockResolvedValue(null); // No existing user
        prismaMock.user.create.mockResolvedValue({ id: 1, name: "Test User", email: "test@test.com" });

        const res = await request(app).post("/auth/register").send({
            name: "Test User",
            email: "test@test.com",
            password: "password123"
        });

        expect(res.status).toBe(201);
        expect(res.body.msg).toBe("User registered");
        expect(res.body.token).toBeDefined();
    });

    it("should prevent duplicate signup", async () => {
        prismaMock.user.findUnique.mockResolvedValue({ id: 1 }); // User exists

        const res = await request(app).post("/auth/register").send({
            name: "Test User",
            email: "duplicate@test.com",
            password: "password123"
        });
        expect(res.status).toBe(409);
        expect(res.body.msg).toBe("Email already registered");
    });

    it("should reject login with wrong password", async () => {
        const hashedPw = await bcrypt.hash("correctpassword", 10);
        prismaMock.user.findUnique.mockResolvedValue({ id: 1, password: hashedPw });

        const res = await request(app).post("/auth/login").send({
            email: "test@test.com",
            password: "wrongpassword"
        });

        expect(res.status).toBe(401);
        expect(res.body.msg).toBe("Invalid credentials");
    });
});
