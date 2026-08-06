import express from 'express'; // Importa o framework Express para criar o servidor web
import { fileURLToPath } from 'url'; // Importa a função fileUrlToPath para converter URLs de arquivos em caminhos de sistema de arquivos
import { dirname } from 'path'; // Importa a função dirname para obter o diretório de um caminho de arquivo
import path from 'path'; // Importa o módulo path para manipular caminhos de arquivos
import { connectDatabase } from './config/database.js';
import { config } from "dotenv"
config();
import productRouter from './router/ProductRouter.js';
import cors from 'cors';
import userRouter from './router/UserRouter.js';
import {createServer} from 'http';
import { Server } from 'socket.io';


const __filename = fileURLToPath(import.meta.url); // Converte a URL do módulo atual para um caminho de arquivo
const __dirname = dirname(__filename); // Obtém o diretório do arquivo atual

const app = express(); // Cria uma instância do aplicativo Express
const port = process.env.PORT || 8000; // Define a porta em que o servidor irá escutar

const server = createServer(app); // Cria um servidor HTTP usando o aplicativo Express
const serverSocket = new Server(server,{
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
}); // Cria um servidor de socket usando o servidor HTTP

serverSocket.on("connection", (socket) => {
    console.log("Novo cliente conectado", socket.id);
    socket.on("disconnect", () => {
        console.log("Cliente desconectado", socket.id);
    });
    socket.on("set_username", (username) => {
        socket.data.username = username;
    });
    socket.on("message", (text) => {
        serverSocket.emit("receive_message", {authorId: socket.id, author: socket.data.username, text: text});
    });
});

server.listen(8080, () => {
    console.log("Servidor socket rodando na porta 8080");
});

app.use(express.static(path.join(__dirname, 'public'))); // Serve arquivos estáticos da pasta 'public'
app.use(express.json()) // Middleware para parsear o corpo das requisições como JSON

app.use(cors())
app.use("/products", productRouter )

app.use("/auth",userRouter)

app.listen(port, () => { // Inicia o servidor e escuta na porta definida
    console.log(`Servidor rodando na porta ${port}`); // Imprime uma mensagem no console indicando que o servidor está rodando
});

connectDatabase();