import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getToken } from './api';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export function useSocket(onMessage: (msg: any) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('newMessage', onMessage);

    socketRef.current = socket;

    return () => {
      socket.off('newMessage', onMessage);
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = (payload: { text: string; studentId?: string }) => {
    socketRef.current?.emit('sendMessage', payload);
  };

  return { sendMessage };
}
