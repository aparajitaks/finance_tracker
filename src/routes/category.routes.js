const express = require("express");
const {
    createCategory,
    getCategories,
    deleteCategory,
    seedCategories,
} = require("../controllers/category.controller");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.post("/seed", authMiddleware, seedCategories);
router.post("/", authMiddleware, createCategory);
router.get("/", authMiddleware, getCategories);
router.delete("/:id", authMiddleware, deleteCategory);

module.exports = router;
