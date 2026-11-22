const onlineUsers = new Map<string, Set<string>>();

export function addUser(userId: string, socketId: string): boolean {
  const userSockets = onlineUsers.get(userId) ?? new Set<string>();
  const wasOffline = userSockets.size === 0; // prevent duplicate notifications when multiple tabs

  userSockets.add(socketId);
  onlineUsers.set(userId, userSockets);

  return wasOffline;
}

export function deleteUser(userId: string, socketId: string): boolean {
  const userSockets = onlineUsers.get(userId);
  if (!userSockets) {
    return false;
  }

  userSockets.delete(socketId);
  if (userSockets.size === 0) {
    onlineUsers.delete(userId);
    return true;
  }

  return false;
}

export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId);
}

export function getOnlineUsers(): string[] {
  return [...onlineUsers.keys()];
}
