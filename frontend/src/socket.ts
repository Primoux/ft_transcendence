import { io } from 'socket.io-client';

// export const socket = io('http://localhost:5003', {autoConnect: false, withCredentials: true}); // dev
// export const socket = io({autoConnect: false, withCredentials: true}); // prod
export const socket = io(import.meta.env.VITE_BACKEND_URL || undefined, {autoConnect: false, withCredentials: true});
