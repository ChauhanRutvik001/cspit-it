import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

// Create context
const SocketContext = createContext(null);

// Socket provider component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const user = useSelector((store) => store.app.user);
  const authStatus = useSelector((store) => store.app.authStatus);

  // Connect to socket when user is authenticated
  useEffect(() => {
    let socketInstance = null;

    // Only try to connect if user is authenticated
    if (authStatus && user?.id) {
      // Create socket connection
      socketInstance = io('http://localhost:3100', {
        withCredentials: true,
      });

      // Set socket to state
      setSocket(socketInstance);

      // Authentication with socket
      socketInstance.on('connect', () => {
        console.log('Socket connected');
        socketInstance.emit('authenticate', user.id);
      });

      // Handle connection errors
      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      // Clean up on unmount
      return () => {
        if (socketInstance) {
          socketInstance.disconnect();
        }
      };
    }
  }, [authStatus, user?.id]);

  // Context value
  const value = {
    socket,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook for using socket
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};