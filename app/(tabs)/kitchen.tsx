import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, ActivityIndicator, Checkbox, useTheme, Chip } from 'react-native-paper';
import ApiService from '../../src/api/ApiService';

type Pizza = {
  pizzaId: string;
  name: string;
  quantity: number;
  isCooked?: boolean;
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

export default function KitchenScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  // Load orders when the component mounts
  useEffect(() => {
    loadOrders();

    // Set up refresh interval (every 15 seconds)
    const refreshInterval = setInterval(() => {
      loadOrders(false); // Silent refresh (no loading indicator)
    }, 15000);
    
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
        // Filter to only show pending and in-progress orders
        const kitchenOrders = result.filter((order: Order) => 
          order.status === 'pending' || order.status === 'in-progress');
        setOrders(kitchenOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      if (showLoading) {
        Alert.alert('Error', 'Failed to load kitchen orders');
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

  // Toggle pizza cooked status
  const togglePizzaCooked = async (order: Order, pizzaIndex: number) => {
    try {
      const updatedOrder = { ...order };
      const pizza = updatedOrder.pizzas[pizzaIndex];
      
      // Toggle the isCooked status
      pizza.isCooked = !pizza.isCooked;
      
      // Determine if all pizzas are cooked
      const allCooked = updatedOrder.pizzas.every(p => p.isCooked);
      
      // If all pizzas are cooked, mark the order as completed
      if (allCooked) {
        updatedOrder.status = 'completed';
      } else if (updatedOrder.status !== 'in-progress') {
        updatedOrder.status = 'in-progress';
      }

      // Update the order in state for immediate UI feedback
      const newOrders = [...orders];
      const orderIndex = newOrders.findIndex(o => 
        (o.id || o.orderId) === (updatedOrder.id || updatedOrder.orderId)
      );
      
      if (orderIndex !== -1) {
        newOrders[orderIndex] = updatedOrder;
      }
      
      setOrders(newOrders);
      
      // Send the update to the API
      const response = await ApiService.updatePizzaStatus(
        updatedOrder.id || updatedOrder.orderId || '',
        pizzaIndex,
        pizza.isCooked || false
      );
      
      if (response.error) {
        // If there's an error, revert the changes
        loadOrders();
        Alert.alert('Error', 'Failed to update pizza status');
      }
    } catch (error) {
      console.error('Error updating pizza status:', error);
      loadOrders();
      Alert.alert('Error', 'Failed to update pizza status');
    }
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

  // Get urgency text and color
  const getUrgencyInfo = (orderTime: string, prepTime: number = 15) => {
    const now = new Date();
    const orderDate = new Date(orderTime);
    const dueDate = new Date(orderDate.getTime() + (prepTime * 60000));
    const timeLeft = dueDate.getTime() - now.getTime();
    
    // Convert to minutes
    const minutesLeft = Math.floor(timeLeft / 60000);
    
    if (minutesLeft < 0) {
      return { text: 'OVERDUE', color: '#F44336' };
    } else if (minutesLeft < 5) {
      return { text: 'URGENT', color: '#FF9800' };
    } else {
      return { text: `${minutesLeft} min left`, color: '#4CAF50' };
    }
  };

  // Render each pizza item in an order
  const renderPizzaItem = (pizza: Pizza, index: number, order: Order) => {
    const hasSpecialInstructions = 
      pizza.specialInstructions && pizza.specialInstructions.trim().length > 0;
    
    return (
      <View key={`${order.id || order.orderId}-pizza-${index}`} style={styles.pizzaItem}>
        <View style={styles.pizzaHeader}>
          <View style={styles.pizzaInfo}>
            <Text style={styles.pizzaName}>{pizza.name}</Text>
            {pizza.quantity > 1 && (
              <Chip size={20} style={styles.quantityChip}>
                x{pizza.quantity}
              </Chip>
            )}
          </View>
          <Checkbox
            status={pizza.isCooked ? 'checked' : 'unchecked'}
            onPress={() => togglePizzaCooked(order, index)}
          />
        </View>
        
        {hasSpecialInstructions && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsLabel}>Special instructions:</Text>
            <Text style={styles.instructionsText}>
              {pizza.specialInstructions}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Render each order item
  const renderOrderItem = ({ item }: { item: Order }) => {
    const totalPizzas = item.pizzas.reduce((sum, pizza) => sum + pizza.quantity, 0);
    const dueTime = calculateDueTime(item.orderTime, item.prepTime || 15);
    const urgency = getUrgencyInfo(item.orderTime, item.prepTime || 15);
    
    return (
      <Card style={styles.orderCard} mode="outlined">
        <Card.Content>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderTitle}>
                Order #{item.orderId || item.id}
              </Text>
              <Text style={styles.orderTime}>
                Ordered at {formatOrderTime(item.orderTime)}
              </Text>
            </View>
            <View style={styles.orderTimeInfo}>
              <Text style={styles.dueTimeText}>Due: {dueTime}</Text>
              <Text style={[styles.urgencyText, { color: urgency.color }]}>
                {urgency.text}
              </Text>
            </View>
          </View>
          
          <View style={styles.orderDetails}>
            <View style={styles.orderInfoRow}>
              <Text style={styles.customerName}>
                {item.customerName || 'Walk-in Customer'}
              </Text>
              <Chip mode="outlined" style={{ borderColor: theme.colors.primary }}>
                {item.platform || 'Walk-in'}
              </Chip>
            </View>
            
            <View style={styles.pizzasList}>
              {item.pizzas.map((pizza, index) => 
                renderPizzaItem(pizza, index, item)
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Loading indicator
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading kitchen orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={item => (item.id || item.orderId || '').toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders in the kitchen</Text>
            <Text style={styles.emptySubtext}>Pull down to refresh</Text>
          </View>
        }
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
    paddingBottom: 16,
  },
  orderCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderTime: {
    fontSize: 14,
    color: '#666',
  },
  orderTimeInfo: {
    alignItems: 'flex-end',
  },
  dueTimeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  urgencyText: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 2,
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    paddingTop: 12,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontWeight: '500',
  },
  pizzasList: {
    marginTop: 4,
  },
  pizzaItem: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
  },
  pizzaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pizzaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pizzaName: {
    fontSize: 15,
    fontWeight: '500',
  },
  quantityChip: {
    marginLeft: 8,
    backgroundColor: '#eeeeee',
  },
  instructionsContainer: {
    marginTop: 8,
    backgroundColor: '#FFF8E1',
    padding: 8,
    borderRadius: 4,
  },
  instructionsLabel: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
  instructionsText: {
    fontSize: 14,
    marginTop: 2,
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
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
