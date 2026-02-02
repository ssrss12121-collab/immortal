import { io, Socket } from 'socket.io-client';

// Use environment variable or default to localhost:5000
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket;

export const initiateSocketConnection = (token?: string) => {
    socket = io(SOCKET_URL, {
        auth: {
            token: token
        },
    });
    console.log('Connecting to socket...');
};

export const disconnectSocket = () => {
    if (socket) socket.disconnect();
};

export const getSocket = (): Socket | null => {
    if (!socket) {
        return null;
    }
    return socket;
};
