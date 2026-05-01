const request = require("supertest");
const app = require("../index");
const { prismaMock } = require("./setup");
const jwt = require("jsonwebtoken");

describe("Transaction System Validation", () => {
    let token;
    beforeAll(() => {
        token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET);
    });

    it("should block unauthenticated access", async () => {
        const res = await request(app).get("/transactions");
        expect(res.status).toBe(401);
    });

    it("should reject negative amounts during creation", async () => {
        const res = await request(app)
            .post("/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({
                amount: -500, // Invalid
                type: "expense",
                description: "Groceries",
                date: new Date().toISOString(),
                categoryId: 1
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("should successfully fetch transactions with pagination", async () => {
        prismaMock.transaction.findMany.mockResolvedValue([{ id: 1, amount: 100 }]);
        prismaMock.transaction.count.mockResolvedValue(1);

        const res = await request(app)
            .get("/transactions?page=1&limit=10")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.transactions.length).toBe(1);
        expect(res.body.data.pagination.total).toBe(1);
    });

    it("should block unauthorized transaction deletes", async () => {
        // Mock a transaction owned by userId 999, but request is userId 1
        prismaMock.transaction.findUnique.mockResolvedValue({ id: 1, userId: 999 });

        const res = await request(app)
            .delete("/transactions/1")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(403);
        expect(res.body.msg).toBe("Not authorized to delete this transaction");
    });
});
