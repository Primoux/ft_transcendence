import { io } from '../server.ts'
import { Server } from 'socket.io'
import type { NextFunction } from 'express'

/**
 * intercept handshake
 * use auth to authenticate connection
 * retrieve userId
 * socket.data.userId = userId
 * if success -> next()
 * else -> next(new Error)
 */

io.use((socket: Server, next: NextFunction) => {
  if (isValid(socket.request)) {
    next();
  } else {
    next(new Error("invalid"));
  }
});
