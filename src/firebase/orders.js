import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';

// Collection reference
const ordersRef = collection(db, 'orders');

// Get all orders for a specific user
export const getUserOrders = async (userId) => {
  try {
    const q = query(
      ordersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return orders;
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
};

// Get a single order by ID
export const getOrderById = async (orderId) => {
  try {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Order not found');
    }
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
};

// Subscribe to real-time updates for a specific order
export const subscribeToOrder = (orderId, callback) => {
  const docRef = doc(db, 'orders', orderId);
  
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({
        id: doc.id,
        ...doc.data()
      });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error subscribing to order:', error);
  });
};

// Subscribe to real-time updates for all user orders
export const subscribeToUserOrders = (userId, callback) => {
  const q = query(
    ordersRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    callback(orders);
  }, (error) => {
    console.error('Error subscribing to user orders:', error);
  });
};

// Create a new order
export const createOrder = async (orderData) => {
  try {
    const newOrder = {
      ...orderData,
      createdAt: Timestamp.now(),
      status: 'pending',
    };
    
    const docRef = await addDoc(ordersRef, newOrder);
    return {
      id: docRef.id,
      ...newOrder
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, { 
      status,
      updatedAt: Timestamp.now() 
    });
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};
