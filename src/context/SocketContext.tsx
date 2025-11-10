import { createContext, useContext, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const socket = io(import.meta.env.VITE_SOCKET_URL, {
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    withCredentials: true
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