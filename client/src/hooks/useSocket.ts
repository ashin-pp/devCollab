import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { store } from '../store';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const useSocket = (workspaceId?: string) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const token = store.getState().auth.accessToken;
        
        const newSocket = io(SOCKET_URL, {
            auth: { token },
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
            if (workspaceId) {
                newSocket.emit('join_workspace', workspaceId);
            }
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [workspaceId]);

    return socket;
};
