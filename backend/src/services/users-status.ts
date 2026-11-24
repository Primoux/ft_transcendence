const onlineUsers = new Map<string, Set<string>>();
const pendingUsers = new Map<string, NodeJS.Timeout>();

export function addUser(userId: string, socketId: string): boolean {
  const timer = pendingUsers.get(userId);
  if (timer) {
    clearTimeout(timer);
    pendingUsers.delete(userId);
  }

  const userSockets = onlineUsers.get(userId) ?? new Set<string>();
  const wasOffline = userSockets.size === 0 && !(!!timer); // prevent duplicate notifications when multiple tabs && refresh

  userSockets.add(socketId);
  onlineUsers.set(userId, userSockets);

  return wasOffline;
}

export function deleteUser(userId: string, socketId: string, onDisconnect: () => void) {
  const userSockets = onlineUsers.get(userId);
  if (!userSockets) {
    return ;
  }

  userSockets.delete(socketId);
  if (userSockets.size > 0) {
    return ;
  }
  const timeout = setTimeout(() => {
    if (pendingUsers.get(userId) !== timeout) {
      return ;
    }
    const cmp = onlineUsers.get(userId);
    if (cmp && cmp.size > 0) {
      pendingUsers.delete(userId);
      return ;
    }
    onlineUsers.delete(userId);
    pendingUsers.delete(userId);
    onDisconnect();
  }, 2000); // 2s buffer to reconnect so refreshing page wont send a log in notificaiton to friends
  pendingUsers.set(userId, timeout);
}

export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId);
}

export function getOnlineUsers(): string[] {
  return [...onlineUsers.keys()];
}
