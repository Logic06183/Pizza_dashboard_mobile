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
  Timestamp,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from './config';

// Collection references
const ordersRef = collection(db, 'orders');
const pizzasRef = collection(db, 'pizzas');
const customersRef = collection(db, 'customers');

/**
 * Fetch all pizza types from the existing database
 */
export const getPizzaTypes = async () => {
  try {
    const querySnapshot = await getDocs(pizzasRef);
    const pizzas = [];
    
    querySnapshot.forEach((doc) => {
      pizzas.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return pizzas;
  } catch (error) {
    console.error('Error getting pizza types:', error);
    throw error;
  }
};

/**
 * Get a paginated list of orders from the dashboard
 */
export const getOrdersPaginated = async (lastDoc = null, limitSize = 20) => {
  try {
    let q;
    
    if (lastDoc) {
      q = query(
        ordersRef,
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(limitSize)
      );
    } else {
      q = query(
        ordersRef,
        orderBy('createdAt', 'desc'),
        limit(limitSize)
      );
    }
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    let lastVisible = null;
    
    if (!querySnapshot.empty) {
      lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      querySnapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data()
        });
      });
    }
    
    return { orders, lastVisible };
  } catch (error) {
    console.error('Error getting paginated orders:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time order updates for mobile dashboard
 */
export const subscribeToOrderUpdates = (callback, limitSize = 50) => {
  const q = query(
    ordersRef,
    orderBy('createdAt', 'desc'),
    limit(limitSize)
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
    console.error('Error subscribing to order updates:', error);
  });
};

/**
 * Get order stats for mobile dashboard
 */
export const getOrderStats = async () => {
  try {
    // Get total orders count
    const totalOrdersQuery = query(ordersRef);
    const totalOrdersSnapshot = await getDocs(totalOrdersQuery);
    const totalOrders = totalOrdersSnapshot.size;
    
    // Get orders by status
    const statuses = ['pending', 'processing', 'completed', 'cancelled', 'delivered'];
    const ordersByStatus = {};
    
    for (const status of statuses) {
      const statusQuery = query(ordersRef, where('status', '==', status));
      const statusSnapshot = await getDocs(statusQuery);
      ordersByStatus[status] = statusSnapshot.size;
    }
    
    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);
    
    const todayQuery = query(
      ordersRef,
      where('createdAt', '>=', todayTimestamp)
    );
    const todaySnapshot = await getDocs(todayQuery);
    const todayOrders = todaySnapshot.size;
    
    // Calculate total revenue (assuming orders have a totalAmount field)
    let totalRevenue = 0;
    let todayRevenue = 0;
    
    todaySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.totalAmount) {
        todayRevenue += data.totalAmount;
      }
    });
    
    totalOrdersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.totalAmount) {
        totalRevenue += data.totalAmount;
      }
    });
    
    return {
      totalOrders,
      ordersByStatus,
      todayOrders,
      todayRevenue,
      totalRevenue
    };
  } catch (error) {
    console.error('Error getting order stats:', error);
    throw error;
  }
};

/**
 * Update an order status
 * This allows mobile staff to update order statuses
 */
export const updateOrderStatus = async (orderId, status, notes = '') => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    
    await updateDoc(orderRef, {
      status,
      updatedAt: Timestamp.now(),
      notes: notes || ''
    });
    
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Get customers list for staff app
 */
export const getCustomers = async (limitSize = 50) => {
  try {
    const q = query(
      customersRef,
      orderBy('name', 'asc'),
      limit(limitSize)
    );
    
    const querySnapshot = await getDocs(q);
    const customers = [];
    
    querySnapshot.forEach((doc) => {
      customers.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return customers;
  } catch (error) {
    console.error('Error getting customers:', error);
    throw error;
  }
};

/**
 * Add a note to an order
 */
export const addOrderNote = async (orderId, note) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      throw new Error('Order not found');
    }
    
    const orderData = orderDoc.data();
    const notes = orderData.notes || [];
    
    await updateDoc(orderRef, {
      notes: [...notes, {
        text: note,
        timestamp: Timestamp.now(),
        author: 'Mobile Staff'
      }]
    });
    
    return true;
  } catch (error) {
    console.error('Error adding order note:', error);
    throw error;
  }
};
