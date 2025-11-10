import { createContext, useContext, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

  const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    transports: ['websocket', 'polling'],
    timeout: 10000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  useEffect(() => {
    if (user) {
      // Join specific room based on user role and branch
      const rooms = [];
      
      // Admin sees everything
      if (user.role === 'admin') {
        rooms.push('admin');
        rooms.push('all-branches');
      }
      
      // Coordinator sees their branch
      else if (user.role === 'coordinator') {
        rooms.push(`branch-${user.branch}`);
        rooms.push('coordinators');
      }
      
      // BSH sees BSH department
      else if (user.role === 'bsh') {
        rooms.push('bsh');
      }

      // Join all applicable rooms
      rooms.forEach(room => socket.emit('join-room', room));
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);