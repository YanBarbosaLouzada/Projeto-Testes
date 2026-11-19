import { logError } from "../utils/logger.js";

export function notFoundHandler(req, res) {
    return res.status(404).json({ message: "Rota não encontrada." });
}

export function errorHandler(error, req, res, next) {
    if (res.headersSent) return next(error);

    const status = error.status === 413 || error.type === "entity.too.large"
        ? 413
        : error.status === 400 || error.type === "entity.parse.failed"
            ? 400
            : 500;
    const message = status === 413
        ? "Corpo da requisição excede o limite permitido."
        : status === 400
            ? "Requisição inválida."
            : "Erro interno do servidor.";

    if (status === 500) {
        logError("Unhandled API error", error, { method: req.method, path: req.path });
    }

    return res.status(status).json({ message });
}
