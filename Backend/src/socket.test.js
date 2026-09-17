import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as ioClient } from 'socket.io-client';

let httpServer, ioServer, porta;

beforeAll((done) => {
    httpServer = createServer();
    ioServer = new Server(httpServer);

    ioServer.on('connection', (socket) => {
        socket.on('set_username', (username) => {
            socket.data.username = username;
        });
        socket.on('message', (text) => {
            ioServer.emit('receive_message', {
                authorId: socket.id,
                author: socket.data.username,
                text: text
            });
        });
    });

    httpServer.listen(() => {
        porta = httpServer.address().port;
        done();
    });
});

afterAll((done) => {
    ioServer.close();
    httpServer.close(done);
});

it('Deve conectar, enviar e receber mensagens', (done) => {
    const clienteA = ioClient(`http://localhost:${porta}`);
    const clienteB = ioClient(`http://localhost:${porta}`);

    clienteB.on('receive_message', (message) => {
        expect(message.author).toBe('Aluno');
        expect(message.text).toBe('Olá suporte!');
        clienteA.close();
        clienteB.close();
        done();
    });

    clienteA.on('connect', () => {
        clienteA.emit('set_username', 'Aluno');
        clienteA.emit('message', 'Olá suporte!');
    });
});