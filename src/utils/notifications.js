import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebase/config';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for push notifications
export async function registerForPushNotificationsAsync() {
  let token;
  
  if (Platform.OS === 'android') {
    // Set notification channel for Android
    await Notifications.setNotificationChannelAsync('order-updates', {
      name: 'Order Updates',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF5722',
    });
  }

  if (Device.isDevice) {
    // Check if we have permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // If we don't have permission, ask for it
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    // Get the Expo push token
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // Replace with your project ID from app.json
    })).data;
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

// Save the push token to the user profile in Firestore
export async function savePushToken(uid, token) {
  if (!uid || !token) return;
  
  try {
    // Use Firestore to store the token
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      pushTokens: arrayUnion(token)
    });
    
    // Also save to AsyncStorage for local reference
    await AsyncStorage.setItem('pushToken', token);
  } catch (error) {
    console.error('Error saving push token:', error);
  }
}

// Send local notification
export async function sendLocalNotification(title, body, data = {}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // null means send immediately
    });
  } catch (error) {
    console.error('Error sending local notification:', error);
  }
}

// Listen for changes to a specific order and send notifications
export function useOrderNotifications(orderId) {
  useEffect(() => {
    if (!orderId) return;
    
    const unsubscribe = subscribeToOrder(orderId, (order) => {
      if (!order) return;
      
      // Check if status has changed
      const previousStatus = AsyncStorage.getItem(`order_${orderId}_status`);
      
      if (previousStatus && previousStatus !== order.status) {
        // Send notification about status change
        const statusMessages = {
          processing: 'Your order is now being prepared!',
          shipped: 'Your order is on the way!',
          delivered: 'Your order has been delivered!',
          cancelled: 'Your order has been cancelled.',
        };
        
        const message = statusMessages[order.status] || `Your order status changed to ${order.status}`;
        
        sendLocalNotification(
          'Order Update',
          message,
          { orderId, status: order.status }
        );
      }
      
      // Save current status for future comparison
      AsyncStorage.setItem(`order_${orderId}_status`, order.status);
    });
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [orderId]);
}

// Hook to initialize push notifications
export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  
  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync()
      .then(token => {
        if (token) {
          setExpoPushToken(token);
          
          // Save the token to the user's profile if logged in
          const currentUser = auth.currentUser;
          if (currentUser) {
            savePushToken(currentUser.uid, token);
          }
        }
      });
    
    // Handle notifications when app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(
      notification => {
        setNotification(notification);
      }
    );
    
    // Handle notification response when user taps
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      response => {
        const { orderId } = response.notification.request.content.data;
        if (orderId) {
          // Navigate to order details when notification is tapped
          // This navigation will be handled by the component using this hook
        }
      }
    );
    
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);
  
  return {
    expoPushToken,
    notification,
  };
}

// Export all the utility functions
export default {
  registerForPushNotificationsAsync,
  savePushToken,
  sendLocalNotification,
  useOrderNotifications,
  usePushNotifications,
};
