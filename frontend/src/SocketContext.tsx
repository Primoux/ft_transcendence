import React, { createContext, useContext } from 'react';

export type SocketProviderProps = {
	children: React.ReactNode;
};

type SocketContextValueType = {
	onlineFriends: Set<string>;
};

export const SocketContext = createContext<SocketContextValueType | null>(null);

export function usePresence() {
	const context = useContext(SocketContext);

	if (!context) {
		throw new Error("usePresence not inside SocketProvider tags");
	}
	return context;
}
