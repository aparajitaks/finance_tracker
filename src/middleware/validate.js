const { ZodError } = require("zod");

exports.validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (err) {
        if (err.name === "ZodError" || err instanceof ZodError) {
            return res.status(400).json({
                success: false,
                msg: "Validation error",
                errors: err.errors ? err.errors.map(e => ({ field: e.path.join('.'), message: e.message })) : []
            });
        }
        next(err);
    }
};
