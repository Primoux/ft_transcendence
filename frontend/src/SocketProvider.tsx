import { useState, useEffect, useRef } from "react";
import { type SocketProviderProps, SocketContext } from "./SocketContext";
import { useAuth } from "./useAuth";
import { socket } from "./socket";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Avatar } from "./components/Avatar";
import type { User } from "./types/user";

export function SocketProvider({children} : SocketProviderProps) {
	const { authState } = useAuth();
	const [onlineFriends, setOnlineFriends] = useState<Set<string>>(new Set());
	const userId = authState.authStatus === "logged-in" ? authState.user.id : null;
	const visibleOnlineFriends = userId ? onlineFriends : new Set<string>();
	const navigate = useNavigate();
	const navRef = useRef(navigate);

	useEffect(() => {
		navRef.current = navigate;
	}, [navigate]);

	useEffect(() => {
		if (!userId) {
			socket.disconnect();
			return;
		}

		function presenceSync(friendsIds: string[]) {
			setOnlineFriends(new Set(friendsIds));
		}

		function friendAccepted (user: User) {
			toast.info(
				<div className="flex items-center gap-1">
					<button
						className="flex items-center gap-1 link link-hover font-bold"
						onClick={() => navRef.current(`/users/${encodeURIComponent(user.username)}`)}
					>
						<Avatar user={user} className="h-6 w-6" />
						{user.username}
					</button>
					{' and you are now friends!'}
				</div>	
			);
		}

		function friendStatus (data: {userId: string; online: boolean}) {
			setOnlineFriends((prev: Set<string>) => {
				const cpy = new Set(prev);
				if (data.online) {
					cpy.add(data.userId);
				} else {
					cpy.delete(data.userId);
				}
				return cpy;
			});
		}

		function friendGoesOnline (user: User) {
			setOnlineFriends((prev: Set<string>) => {
				const cpy = new Set(prev);
				cpy.add(user.id);
				return cpy;
			});
			toast.info(
				<div className="flex items-center gap-1">
					<button
						className="flex items-center gap-1 link link-hover font-bold"
						onClick={() => navigate(`/users/${encodeURIComponent(user.username)}`)}
					>
						<Avatar user={user} className="h-6 w-6" />
						{user.username}
					</button>
					{' logged in!'}
				</div>	
			);
		}
		
		function friendGoesOffline (data: {userId: string}) {
			setOnlineFriends((prev: Set<string>) => {
				const cpy = new Set(prev);
				cpy.delete(data.userId);
				return cpy;
			});
		}
		
		socket.on('presence:sync', presenceSync);
		socket.on('friend:online', friendGoesOnline);
		socket.on('friend:offline', friendGoesOffline);
		socket.on('friend:status', friendStatus);
		socket.on('friend:accepted', friendAccepted);

		socket.connect();
		return () => {
			socket.off('presence:sync', presenceSync);
			socket.off('friend:online', friendGoesOnline);
			socket.off('friend:offline', friendGoesOffline);
			socket.off('friend:status', friendStatus);
			socket.off('friend:accepted', friendAccepted);
			socket.disconnect();
		};
	}, [userId]);

	return (
		<SocketContext.Provider value={{onlineFriends: visibleOnlineFriends}}>
			{children}
		</SocketContext.Provider>
	);
}
