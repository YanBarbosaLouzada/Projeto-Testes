import mongoose from "mongoose";
import { logError } from "../utils/logger.js";

export async function connectDatabase() {
    const dbUrl = process.env.dbUrl;
    if (!dbUrl) throw new Error("dbUrl must be configured before starting the API.");
    const connection = mongoose.connection;

    connection.on("error", (error) => logError("MongoDB connection error", error));

    connection.on("open", () => {
        console.info(JSON.stringify({ level: "info", message: "MongoDB connected" }));
    });
    await mongoose.connect(dbUrl);
}