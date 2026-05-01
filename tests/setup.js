const { mockDeep } = require("jest-mock-extended");
const prisma = require("../src/config/prisma");

jest.mock("../src/config/prisma", () => mockDeep());

beforeEach(() => {
    jest.clearAllMocks();
});

module.exports = { prismaMock: prisma };
