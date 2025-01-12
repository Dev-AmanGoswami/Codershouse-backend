require('dotenv').config(); // Makes all environment variables available
const express = require('express');
const cors = require('cors');
const app = express();
const DbConnect = require('./database');
const cookieParser = require('cookie-parser');
const router = require('./routes');
const ACTIONS = require('./actions');

const server = require('http').createServer(app);
const io = require('socket.io')(server,{
    // Passing CORS options
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

app.use(cookieParser());
const corsOption = {
    credentials: true,
    origin: ['http://localhost:3000']
}

app.use(cors(corsOption));

const PORT = process.env.PORT || 5500;
DbConnect();
// Setting the limit for the body data size
app.use(express.json({
    limit: '8mb'
}));

app.use(router);

// Sockets Implementation
const socketUserMapping = {

}

io.on('connection',(socket) => {
    console.log('New connection', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, user }) => {
        socketUserMapping[socket.id] = user;
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        // Connecting every client with new client, mesh topology
        clients.forEach(clientId => {
            io.to(clientId).emit(ACTIONS.ADD_PEER, {
                peerId: socket.id,
                createOffer: false,
                user
            });
            socket.emit(ACTIONS.ADD_PEER, {
                peerId: clientId,
                createOffer: true,
                user: socketUserMapping[clientId]
            });    
        })
        socket.join(roomId);
    })

    // Handle relay ice
    socket.on(ACTIONS.RELAY_ICE, ({ peerId, iceCandidate }) => {
        io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
            peerId: socket.id,
            iceCandidate
        })
    })

    // Handle relay sdp
    socket.on(ACTIONS.RELAY_SDP, ({ peerId, sessionDescription }) => {
        io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
            peerId: socket.id,
            sessionDescription
        })
    })

    // Handle leaving the room
    const leaveRoom = ({roomId}) => {
        const { rooms } = socket;
        Array.from(rooms).forEach(roomId => {
            const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
            clients.forEach(clientId => {
                io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
                    peerId: socket.id,
                    userId: socketUserMapping[socket.id]?.id
                });
                socket.emit(ACTIONS.REMOVE_PEER, {
                    peerId: clientId,
                    userId: socketUserMapping[socket.id]?.id
                })    
            });
            socket.leave(roomId);
        })

        delete socketUserMapping[socket.id];
    }
    socket.on(ACTIONS.LEAVE, leaveRoom);

    // Triggers when any user closes browser
    socket.on('disconnecting', leaveRoom);
})


server.listen(PORT,() =>{
    console.log(`Listening on port ${PORT}`);
});