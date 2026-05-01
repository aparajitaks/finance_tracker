const logger = require("./logger");

const requiredEnvVars = [
    "DATABASE_URL",
    "DIRECT_DATABASE_URL",
    "JWT_SECRET"
];

const validateEnv = () => {
    const missing = requiredEnvVars.filter(v => !process.env[v]);
    
    if (missing.length > 0) {
        logger.error(`❌ FATAL: Missing required environment variables: ${missing.join(", ")}`);
        logger.error("Please add these in your Render dashboard (Environment tab) or .env file.");
        process.exit(1);
    }
    
    logger.info("✅ Environment variables validated.");
};

module.exports = validateEnv;
