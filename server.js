const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = {};

app.use(express.static('public')); // Serve static files (HTML, JS, CSS)

io.on('connection', (socket) => {
    console.log('a user connected: ' + socket.id);
    players[socket.id] = { x: 0, y: 0, score: 0 };

    // Listen for player movements
    socket.on('move', (data) => {
        players[socket.id] = { ...players[socket.id], x: data.x, y: data.y };
        // Broadcast updated position to all connected clients
        io.emit('updatePositions', players);
    });

    // Listen for fruit collisions (or any other game logic you want to sync)
    socket.on('collision', (data) => {
        players[socket.id].score++;
        io.emit('updateScores', players);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected: ' + socket.id);
        delete players[socket.id];
        io.emit('updatePositions', players);
    });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
