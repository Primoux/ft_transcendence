import { Socket } from 'socket.io'
import { SESSION_COOKIE, authRepository } from "../data/repositories/auth.repository.ts";
import { parse } from 'cookie';

/**
 * intercept handshake
 * use auth to authenticate connection
 * retrieve userId
 * socket.data.userId = userId
 * if success -> next()
 * else -> next(new Error)
 */

export async function socketMiddleware(socket: Socket, next: (error?: Error) => void) {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) {
      return next(new Error('not auth (socket)'));
    }
    
    const cookies = parse(cookieHeader);
    const token = cookies[SESSION_COOKIE];
    if (!token) {
      return next(new Error('not auth (socket)'));
    }

    const session = await authRepository.validateSession(token);
    if (!session) {
      return next(new Error("Invalid or expired session (socket)"));
    }

    socket.data.userId = session.userId;
    socket.data.sessionId = session.id;
    return next();
  } catch (error) {
    console.error('Socket auth error: ', error);
    return next(new Error('auth failed (socket)'));
  }
}