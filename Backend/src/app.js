import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import productRouter from './router/ProductRouter.js';
import userRouter from './router/UserRouter.js';
import { getAllowedOrigins } from './config/security.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin: getAllowedOrigins(),
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '20kb' }));
app.use('/products', productRouter);
app.use('/auth', userRouter);
app.use(notFoundHandler);
app.use(errorHandler);