import { useState, useEffect } from "react";
import { type SocketProviderProps, SocketContext } from "./SocketContext";
import { useAuth } from "./useAuth";
import { socket } from "./socket";
import { toast } from "sonner";

export function SocketProvider({children} : SocketProviderProps) {
	const { authState } = useAuth();
	const [onlineFriends, setOnlineFriends] = useState<Set<string>>(new Set());
	const userId = authState.authStatus === "logged-in" ? authState.user.id : null;
	const visibleOnlineFriends = userId ? onlineFriends : new Set<string>();

	useEffect(() => {
		// const userId = authState.authStatus;
		if (!userId) {
			socket.disconnect();
			return;
		}

		function presenceSync(friendsIds: string[]) {
			setOnlineFriends(new Set(friendsIds));
		}

		function friendGoesOnline (data: {userId: string; username: string}) {
			setOnlineFriends((prev: Set<string>) => {
				const cpy = new Set(prev);
				cpy.add(data.userId);
				return cpy;
			});
			toast.info(`${data.username} logged in!`);
		}
		
		function friendGoesOffline (data: {userId: string; username: string}) {
			setOnlineFriends((prev: Set<string>) => {
				const cpy = new Set(prev);
				cpy.delete(data.userId);
				return cpy;
			});
			toast.info(`${data.username} went offline`);
		}
		
		socket.on('presence:sync', presenceSync);
		socket.on('friend:online', friendGoesOnline);
		socket.on('friend:offline', friendGoesOffline);

		socket.connect();
		return () => {
			socket.off('presence:sync', presenceSync);
			socket.off('friend:online', friendGoesOnline);
			socket.off('friend:offline', friendGoesOffline);
			socket.disconnect();
		};
	}, [userId]);

	return (
		<SocketContext.Provider value={{onlineFriends: visibleOnlineFriends}}>
			{children}
		</SocketContext.Provider>
	);
}
