export function logError(message, error, context = {}) {
    console.error(JSON.stringify({
        level: "error",
        message,
        ...context,
        error: {
            name: error?.name,
            message: error?.message
        },
        timestamp: new Date().toISOString()
    }));
}
