import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { getAllowedOrigins, getJwtSecret } from './config/security.js';
import { logError } from './utils/logger.js';

const port = Number(process.env.PORT || 4444);
const apiServer = createServer(app);

const serverSocket = new Server({
  cors: { origin: getAllowedOrigins(), methods: ['GET', 'POST'], credentials: true },
});

serverSocket.on('connection', (socket) => {
  socket.on('set_username', (username) => {
    if (typeof username === 'string' && username.trim() && username.trim().length <= 100) {
      socket.data.username = username.trim();
    }
  });
  socket.on('message', (text) => {
    if (typeof text !== 'string' || !text.trim() || text.length > 1000 || !socket.data.username) return;
    serverSocket.emit('receive_message', {
      authorId: socket.id,
      author: socket.data.username,
      text: text.trim()
    });
  });
});

async function startServer() {
  getJwtSecret();
  await connectDatabase();

  serverSocket.attach(apiServer);
  apiServer.listen(port, () => {
    console.info(JSON.stringify({ level: 'info', message: 'API and chat server listening', port }));
  });
}

startServer().catch((error) => {
  logError('Server startup failed', error);
  process.exitCode = 1;
});