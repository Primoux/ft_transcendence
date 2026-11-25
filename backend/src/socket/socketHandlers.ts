import type { Server, Socket } from 'socket.io'
import { socketMiddleware } from '../middleware/socketMiddleware.ts';
import { addUser, deleteUser, isUserOnline } from '../services/users-status.ts'
import { friendshipRepository } from '../data/repositories/friendship.repository.ts';
import { userRepository } from '../data/repositories/user.repository.ts';

export function statusSocketHandlers(io: Server) {
	io.use(socketMiddleware);

	io.on('connection', async (socket: Socket) => {
		try {
			const userId = socket.data.userId;
			const user = await userRepository.findById(userId);
			if (!user) {
				console.error("User not found: ", userId);
				socket.disconnect(true);
				return ;
			}

			await socket.join(`user:${userId}`); // create room to be send notification
			const changedStatus = addUser(userId, socket.id);

			socket.on('disconnect', () => {
				deleteUser(userId, socket.id, async () => {
					const friends = await friendshipRepository.findFriends(userId);
					for (const friend of friends) {
						io.to(`user:${friend.friend.id}`).emit('friend:offline', {userId});
					}
				});
			});
			
			const friends = await friendshipRepository.findFriends(userId);
			const friendsIds = friends.map(({friend}) => friend.id);

			if (socket.connected) {
				socket.emit('presence:sync', friendsIds.filter(isUserOnline));
			}
			
			if (changedStatus) {
				for (const friend of friendsIds) {
					io.to(`user:${friend}`).emit('friend:online', user);
				}
			}

		} catch (error) {
			console.error("error with status handler: ", error);
			socket.disconnect(true);
		}
	});
}
