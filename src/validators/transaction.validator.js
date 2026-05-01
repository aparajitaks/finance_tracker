const z = require("zod");

exports.createTransactionSchema = z.object({
    amount: z.number().positive("Amount must be greater than 0"),
    type: z.enum(["income", "expense"], { errorMap: () => ({ message: "Type must be income or expense" }) }),
    description: z.string().min(1, "Description is required"),
    date: z.string().datetime({ message: "Invalid date format. Use ISO 8601 (e.g., 2026-05-01T00:00:00Z)" }),
    categoryId: z.number().int().positive("Category ID must be a positive integer"),
});

exports.updateTransactionSchema = exports.createTransactionSchema.partial();
