import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, Card, Button, Chip, useTheme, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { subscribeToUserOrders } from '../../src/firebase/orders';

const OrderStatusColors = {
  pending: '#FFC107',  // Amber
  processing: '#2196F3', // Blue
  shipped: '#9C27B0',  // Purple
  delivered: '#4CAF50', // Green
  cancelled: '#F44336', // Red
};

const OrderItem = ({ order, onPress }) => {
  const theme = useTheme();
  const statusColor = OrderStatusColors[order.status] || theme.colors.primary;
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card style={styles.card} onPress={() => onPress(order)}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.orderId}>
            Order #{order.id.substring(0, 8)}
          </Text>
          <Chip
            style={[styles.statusChip, { backgroundColor: statusColor }]}
            textStyle={{ color: 'white' }}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Chip>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text>{formatDate(order.createdAt)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Items:</Text>
            <Text>{order.items?.length || 0} items</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total:</Text>
            <Text style={styles.totalPrice}>
              ${order.totalAmount?.toFixed(2) || '0.00'}
            </Text>
          </View>
        </View>
      </Card.Content>
      
      <Card.Actions>
        <Button onPress={() => onPress(order)}>View Details</Button>
      </Card.Actions>
    </Card>
  );
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!user) return;
    
    let unsubscribe;
    
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Subscribe to real-time updates
        unsubscribe = subscribeToUserOrders(user.uid, (newOrders) => {
          setOrders(newOrders);
          setLoading(false);
          setRefreshing(false);
        });
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
        setRefreshing(false);
      }
    };
    
    fetchOrders();
    
    // Cleanup subscription
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);
  
  const onRefresh = () => {
    setRefreshing(true);
    // The subscription will automatically update
  };
  
  const handleOrderPress = (order) => {
    router.push(`/order/${order.id}`);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        All Orders
      </Text>
      
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            You don't have any orders yet
          </Text>
          <Button 
            mode="contained" 
            style={styles.emptyButton}
            onPress={() => {
              // Navigate to a screen where users can place orders
              router.push('/new-order');
            }}
          >
            Place an Order
          </Button>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderItem order={item} onPress={handleOrderPress} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontWeight: 'bold',
  },
  statusChip: {
    height: 28,
  },
  divider: {
    marginVertical: 8,
  },
  orderDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    opacity: 0.7,
  },
  totalPrice: {
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyButton: {
    paddingHorizontal: 16,
  },
});
