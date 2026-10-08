import { config } from 'dotenv';
config();
import { createServer } from 'http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { connectDatabase } from './config/database.js';

const port = process.env.PORT || 8000;
const server = createServer(app);

const serverSocket = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'], credentials: true },
});

serverSocket.on('connection', (socket) => {
  socket.on('set_username', (username) => { socket.data.username = username; });
  socket.on('message', (text) => {
    serverSocket.emit('receive_message', { authorId: socket.id, author: socket.data.username, text });
  });
});

server.listen(8080, () => console.log('Servidor socket rodando na porta 8080'));
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
connectDatabase();