import type { Server, Socket } from 'socket.io'
import { socketMiddleware } from '../middleware/socketMiddleware.ts';
import { addUser, deleteUser, isUserOnline } from '../services/users-status.ts'
import { friendshipRepository } from '../data/repositories/friendship.repository.ts';
import { userRepository } from '../data/repositories/user.repository.ts';

export function statusSocketHandlers(io: Server) {
	io.use(socketMiddleware);

	io.on('connection', async (socket: Socket) => {
		const userId = socket.data.userId;
		const user = await userRepository.findById(userId);
		if (!user) {
			console.error("User not found: ", userId);
			socket.disconnect(true);
			return ;
		}
		// const { username, avatarKey } = user;
		// const {username} = await userRepository.findById(userId);

		await socket.join(`user:${userId}`); // create room to be send notification
		console.log("Connect user: ", userId);

		const changedStatus = addUser(userId, socket.id);
		
		const friends = await friendshipRepository.findFriends(userId);
		const friendsIds = friends.map(({friend}) => friend.id);
		socket.emit('presence:sync', friendsIds.filter(isUserOnline));
		
		if (changedStatus) {
			for (const friend of friendsIds) {
				io.to(`user:${friend}`).emit('friend:online', user);
			}
		}

		socket.on('disconnect', async () => {
			const changedStatus = deleteUser(userId, socket.id);
			if (!changedStatus) {
				return ;
			}

			const friends = await friendshipRepository.findFriends(userId);
			for (const friend of friends) {
				io.to(`user:${friend.friend.id}`).emit('friend:offline', {userId});
			}
		});
	});
}
