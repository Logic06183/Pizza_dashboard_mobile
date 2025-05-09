import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, ActivityIndicator, Chip, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import ApiService from '../../src/api/ApiService';
import ViewFix from '../../src/components/ViewFix';

type Pizza = {
  pizzaId: string;
  name: string;
  quantity: number;
  toppings?: string[];
  specialInstructions?: string;
};

type Order = {
  id?: string;
  orderId?: string;
  customerName: string;
  status: string;
  orderTime: string;
  pizzas: Pizza[];
  prepTime?: number;
  platform?: string;
  urgency?: 'low' | 'medium' | 'high';
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const router = useRouter();

  // Load orders when the component mounts
  useEffect(() => {
    loadOrders();

    // Set up refresh interval (every 30 seconds)
    const refreshInterval = setInterval(() => {
      loadOrders(false); // Silent refresh (no loading indicator)
    }, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(refreshInterval);
  }, []);

  // Fetch orders from the API
  const loadOrders = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      const result = await ApiService.getOrders();
      
      if (result.error) {
        Alert.alert('Error', result.message || 'Failed to load orders');
      } else {
        // Filter out delivered orders
        const activeOrders = result.filter((order: Order) => order.status !== 'delivered');
        setOrders(activeOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      if (showLoading) {
        Alert.alert('Error', 'Failed to load orders');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Pull-to-refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  // Navigate to the order details screen
  const viewOrderDetails = (order: Order) => {
    router.push({
      pathname: '/order-details',
      params: { orderId: order.id || order.orderId }
    });
  };

  // Navigate to new order screen
  const createNewOrder = () => {
    router.push('/new-order');
  };

  // Get color for order status
  const getStatusColor = (status: string, urgency?: string) => {
    if (status === 'completed' || status === 'delivered') return '#4CAF50';
    if (urgency === 'high') return '#F44336';
    if (urgency === 'medium') return '#FF9800';
    return '#2196F3';
  };

  // Format order time
  const formatOrderTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Calculate due time
  const calculateDueTime = (orderTime: string, prepTime: number = 15) => {
    const orderDate = new Date(orderTime);
    const dueDate = new Date(orderDate.getTime() + (prepTime * 60000));
    return dueDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Render each order item
  const renderItem = ({ item }: { item: Order }) => {
    const totalPizzas = item.pizzas.reduce((sum, pizza) => sum + pizza.quantity, 0);
    const statusColor = getStatusColor(item.status, item.urgency);
    const dueTime = calculateDueTime(item.orderTime, item.prepTime || 15);
    
    return (
      <TouchableOpacity 
        onPress={() => viewOrderDetails(item)}
        activeOpacity={0.7}
      >
        <Card 
          style={styles.card} 
          mode="outlined"
        >
          <Card.Content>
            <ViewFix style={styles.cardHeader}>
              <ViewFix>
                <Text style={styles.orderId}>Order #{item.orderId || item.id}</Text>
                <Text style={styles.orderTime}>
                  Ordered at {formatOrderTime(item.orderTime)}
                </Text>
              </ViewFix>
              <Chip 
                mode="outlined" 
                textStyle={{ color: statusColor }}
                style={{ borderColor: statusColor }}
              >
                {item.status.toUpperCase()}
              </Chip>
            </ViewFix>
            
            <ViewFix style={styles.orderInfo}>
              <Text style={styles.totalPizzas}>
                {totalPizzas} {totalPizzas === 1 ? 'Pizza' : 'Pizzas'}
              </Text>
              <ViewFix style={styles.platformContainer}>
                <Text style={styles.platformLabel}>Platform:</Text>
                <Text style={styles.platformValue}>{item.platform || 'Walk-in'}</Text>
              </ViewFix>
              <ViewFix style={styles.timeInfo}>
                <Text>Due By:</Text>
                <Text style={styles.dueTime}>{dueTime}</Text>
              </ViewFix>
              {item.customerName && (
                <Text style={styles.customerName}>
                  Customer: {item.customerName}
                </Text>
              )}
            </ViewFix>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  // Loading indicator
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={item => (item.id || item.orderId || '').toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active orders</Text>
            <Text style={styles.emptySubtext}>Pull down to refresh or tap + to add a new order</Text>
          </View>
        }
      />
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={createNewOrder}
        color="white"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra space for FAB
  },
  card: {
    marginBottom: 12,
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  orderInfo: {
    marginBottom: 12,
  },
  totalPizzas: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  platformContainer: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  platformLabel: {
    color: '#666',
  },
  platformValue: {
    fontWeight: '500',
    marginLeft: 4,
  },
  customerName: {
    marginTop: 4,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dueTime: {
    fontSize: 14,
  },
  prepTime: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#e76f51',
  },
});
