const express = require('express');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});


const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const io = new Server(server);

io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);


    // Listen for data from a client device
		socket.on('on_rotate', (data) => {
		    // Broadcast to all other connected clients
		    socket.broadcast.emit('on_rotate', data);
		});

		socket.on('on_shake', () => {
		    // Broadcast to all other connected clients
		    socket.broadcast.emit('on_shake');
		});

		socket.on('disconnect', () => {
		    console.log(`Client disconnected: ${socket.id}`);
		});
});

