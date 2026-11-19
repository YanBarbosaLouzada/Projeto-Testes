import rateLimit from "express-rate-limit";

const skipLimitsInTests = () => process.env.NODE_ENV === "test";
const loginLimit = Number(process.env.AUTH_LOGIN_LIMIT || 10);
if (!Number.isInteger(loginLimit) || loginLimit < 1) {
    throw new Error("AUTH_LOGIN_LIMIT must be a positive integer.");
}

export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: loginLimit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: skipLimitsInTests,
    message: { message: "Muitas tentativas de login. Tente novamente mais tarde." }
});

export const registerRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: skipLimitsInTests,
    message: { message: "Muitas tentativas de cadastro. Tente novamente mais tarde." }
});
