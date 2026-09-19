import { io } from 'socket.io-client';

let socket = null;
let currentJoinedOrderId = null;

const getSOCKET_URL = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }
  return window.location.origin;
};

/**
 * Initialize or get active Socket.IO connection
 */
export const initSocket = (tokenOverride = null) => {
  const token =
    tokenOverride ||
    localStorage.getItem('restaurant_token') ||
    localStorage.getItem('restaurantToken') ||
    localStorage.getItem('restaurant_admin_token') ||
    localStorage.getItem('customer_token') ||
    localStorage.getItem('customerToken') ||
    localStorage.getItem('delivery_token') ||
    localStorage.getItem('deliveryToken');

  if (!token) {
    console.warn('[SocketService] No JWT token available for authentication');
    return null;
  }

  if (socket && socket.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  const socketUrl = getSOCKET_URL();

  socket = io(socketUrl, {
    auth: { token },
    headers: { Authorization: `Bearer ${token}` },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('[SocketService] Connected to Socket.IO server:', socket.id);
    if (currentJoinedOrderId) {
      console.log('[SocketService] Re-joining order room after reconnect:', currentJoinedOrderId);
      socket.emit('join:order', { orderId: currentJoinedOrderId });
    }
  });

  socket.on('connect_error', (err) => {
    console.error('[SocketService] Connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.warn('[SocketService] Disconnected:', reason);
  });

  return socket;
};

/**
 * Join an order tracking room and subscribe to location/status events
 */
export const subscribeToOrderTracking = (orderId, { onLocationUpdate, onStatusUpdate, onError } = {}) => {
  const activeSocket = initSocket();
  if (!activeSocket) return null;

  currentJoinedOrderId = orderId;

  // Clean existing listeners for order tracking
  activeSocket.off('delivery:location:update');
  activeSocket.off('delivery:status:update');
  activeSocket.off('error');

  // Join Order Room
  activeSocket.emit('join:order', { orderId });

  if (onLocationUpdate) {
    activeSocket.on('delivery:location:update', (data) => {
      console.log('[SocketService] Received delivery:location:update', data);
      onLocationUpdate(data);
    });
  }

  if (onStatusUpdate) {
    activeSocket.on('delivery:status:update', (data) => {
      console.log('[SocketService] Received delivery:status:update', data);
      onStatusUpdate(data);
    });
  }

  if (onError) {
    activeSocket.on('error', (err) => {
      console.error('[SocketService] Order room error:', err);
      onError(err);
    });
  }

  return activeSocket;
};

/**
 * Leave order tracking room and unsubscribe listeners
 */
export const unsubscribeFromOrderTracking = (orderId) => {
  if (socket && socket.connected) {
    socket.emit('leave:order', { orderId });
    socket.off('delivery:location:update');
    socket.off('delivery:status:update');
    socket.off('error');
  }
  if (currentJoinedOrderId === orderId) {
    currentJoinedOrderId = null;
  }
};

/**
 * Join a restaurant kitchen room and subscribe to incoming/updated orders
 */
export const subscribeToKitchenOrders = (restaurantId, { onKitchenUpdate, onNewOrder, onError } = {}) => {
  const activeSocket = initSocket();
  if (!activeSocket) return null;

  activeSocket.off('order:kitchen:updated');
  activeSocket.off('order:kitchen:new');
  activeSocket.off('error');

  activeSocket.emit('join:restaurant', { restaurantId });

  if (onKitchenUpdate) {
    activeSocket.on('order:kitchen:updated', (data) => {
      console.log('[SocketService] Received order:kitchen:updated', data);
      onKitchenUpdate(data);
    });
  }

  if (onNewOrder) {
    activeSocket.on('order:kitchen:new', (data) => {
      console.log('[SocketService] Received order:kitchen:new', data);
      onNewOrder(data);
    });
  }

  if (onError) {
    activeSocket.on('error', (err) => {
      console.error('[SocketService] Kitchen room error:', err);
      onError(err);
    });
  }

  return activeSocket;
};

/**
 * Leave restaurant kitchen room
 */
export const unsubscribeFromKitchenOrders = (restaurantId) => {
  if (socket && socket.connected) {
    socket.emit('leave:restaurant', { restaurantId });
    socket.off('order:kitchen:updated');
    socket.off('order:kitchen:new');
    socket.off('error');
  }
};

/**
 * Disconnect socket completely
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentJoinedOrderId = null;
};
