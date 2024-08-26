/* NodeJS declaration */
import express from 'express';
import customLogger from './class/customLogger.js';
import userObj from './class/user.js';
import roomObj from './class/room.js';
import path from 'path';
import cors from 'cors';
import * as url from 'url';

let app = express();

const logger = new customLogger();

/* WebSocket declaration */
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, { cors: '*' });

/* NodeJS implementation */

// Set filePath
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/* middleware */
app.use('/', express.static(path.join(__dirname, 'reactapp/build')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ cors: '*' }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'reactapp/build', 'index.html'));
});

/* Room and User Data */
let room = [
  {
    id: 0,
    name: 'room1',
    count: 1,
    maxCount: 10,
    password: '1111'
  },
  {
    id: 1,
    name: 'room2',
    count: 3,
    maxCount: 7,
    password: '2222'
  }
];

let users = {};

/* API for Chat List */
app.get('/chatList', (req, res) => {
  res.send(room);
});

/* WebSocket implementation */
const WS_port = 5050;
httpServer.listen(WS_port, () => {
  console.log('WebSocket listening at port %d', WS_port);
});

let roomUserCounts = {};
let nickNames = new Set();
let roomUsers = {};

// WebSocket events
io.on("connection", (socket) => {
  logger.info('A Client has connected');

  socket.on('enter_room', ({ nickName, roomName, password }, cb) => {
    // Check for duplicate nickname
    if (nickNames.has(nickName)) {
      cb({ error: '이미 사용중인 닉네임입니다.' });
      return;
    }

    // Find the room and verify the password
    const selectedRoom = room.find(r => r.name === roomName);
    if (selectedRoom && selectedRoom.password !== password) {
      cb({ error: '비밀번호가 틀렸습니다.' });
      return;
    }

    nickNames.add(nickName);
    users[socket.id] = { nickName, roomName };

    logger.info(`Client (${nickName}) entered room (${roomName}).`);

    socket.join(roomName);
    if (!roomUserCounts[roomName]) {
      roomUserCounts[roomName] = 0;
    }
    roomUserCounts[roomName] += 1;

    socket.emit("reply", `${nickName}님이 입장하셨습니다. 반갑습니다.`, "관리자봇");
    socket.broadcast.in(roomName).emit("reply", `${nickName}님이 입장하셨습니다. 반갑습니다.`, "관리자봇");

    if (!roomUsers[roomName]) {
      roomUsers[roomName] = [];
    }
    roomUsers[roomName].push(nickName);
    io.to(roomName).emit('user_count_update', roomUsers[roomName].length);
  });

  socket.on('message', (message, roomName) => {
    logger.info('Received message from client:' + message);
    logger.info('Received message from client room:' + roomName);

    const user = users[socket.id];
    if (user) {
      io.to(roomName).emit('reply', message, user.nickName);
    }
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      const { roomName, nickName } = user;
      logger.info('A client has disconnected');

      if (roomUserCounts[roomName]) {
        roomUserCounts[roomName] -= 1;
      }

      io.to(roomName).emit('message', `(${nickName}) 님이 방을 나가셨습니다.`);
      socket.broadcast.to(roomName).emit('message', `(${nickName}) 님이 방을 나가셨습니다.`);

      delete users[socket.id];
      roomUsers[roomName] = roomUsers[roomName].filter((name) => name !== nickName);
      io.to(roomName).emit('user_count_update', roomUsers[roomName].length);
    }
  });
});

export { app, io };
