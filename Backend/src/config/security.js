export function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error("JWT_SECRET must be set to a value of at least 32 characters.");
    }
    return secret;
}

export function getAllowedOrigins() {
    const configuredOrigins = process.env.CORS_ORIGINS;
    return configuredOrigins
        ? configuredOrigins.split(",").map((origin) => origin.trim()).filter(Boolean)
        : ["http://localhost:5173", "http://127.0.0.1:5173"];
}
