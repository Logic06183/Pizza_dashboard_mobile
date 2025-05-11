import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { db, auth } from '../firebase/config';
import { collection, getDocs, query, limit } from 'firebase/firestore';

const FirebaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [ordersCount, setOrdersCount] = useState(null);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    setConnectionStatus('Testing...');
    setError(null);
    
    try {
      // Try to fetch one document from the orders collection
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, limit(1));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setConnectionStatus('Connected to Firebase, but no orders found');
        setOrdersCount(0);
      } else {
        // Count all orders
        const allOrdersSnapshot = await getDocs(collection(db, 'orders'));
        setConnectionStatus('Connected to Firebase successfully!');
        setOrdersCount(allOrdersSnapshot.size);
        
        // Log the first order for debugging
        console.log('Sample order data:', querySnapshot.docs[0].data());
      }
    } catch (err) {
      console.error('Firebase connection error:', err);
      setConnectionStatus('Failed to connect');
      setError(err.message);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Connection Test</Text>
      <Text style={styles.status}>Status: {connectionStatus}</Text>
      
      {ordersCount !== null && (
        <Text style={styles.info}>Found {ordersCount} orders in database</Text>
      )}
      
      {error && (
        <Text style={styles.error}>Error: {error}</Text>
      )}
      
      <Button 
        mode="contained" 
        onPress={testConnection}
        style={styles.button}
      >
        Test Again
      </Button>
      
      <Text style={styles.projectInfo}>
        Connected to project: pizza-dashboard-92057
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
    color: 'green',
  },
  error: {
    fontSize: 16,
    marginBottom: 10,
    color: 'red',
  },
  button: {
    marginTop: 15,
    marginBottom: 15,
  },
  projectInfo: {
    fontSize: 12,
    color: 'gray',
    marginTop: 10,
  }
});

export default FirebaseConnectionTest;
