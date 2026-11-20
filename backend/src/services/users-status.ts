import { io } from '../server.ts'
import { Server } from 'socket.io';

// type UserId = string;
// type SocketId = string;

const onlineUsers = new Map<string, Set<string>>();

io.on("connection", (socket: Server) => {
  const userId = socket.data.userId;
  const userSockets = onlineUsers.get(userId) ?? new Set();
  
  socket.on("new-user-add", (newUserId: string) => {
    if (!onlineUsers.some((user) => user === newUserId)) {
      onlineUsers.push(newUserId); //, socketId: socket.id});
      console.log("new user online: ", newUserId);
      console.log("all users: ", onlineUsers);
    }
    // to everyone for now, should be to friends
    io.emit("get-users", onlineUsers);
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id)
  })
});
