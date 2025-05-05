import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert, ScrollView } from 'react-native';
import { Text, Card, Divider, Checkbox, Chip, useTheme, ActivityIndicator } from 'react-native-paper';
import ApiService from '../api/ApiService';

const KitchenScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

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

  // Fetch active orders from the API
  const loadOrders = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      const result = await ApiService.getOrders();
      
      if (result.error) {
        Alert.alert('Error', result.message);
      } else {
        // Filter for pending and in-progress orders
        const activeOrders = result.filter(order => 
          order.status !== 'delivered' && order.status !== 'completed'
        );
        
        // Sort by urgency and time
        const sortedOrders = sortOrdersByUrgency(activeOrders);
        setOrders(sortedOrders);
      }
    } catch (error) {
      if (showLoading) {
        Alert.alert('Error', 'Failed to load kitchen orders');
      }
      console.error('Error loading kitchen orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sort orders by urgency (high, medium, low) and then by order time
  const sortOrdersByUrgency = (ordersList) => {
    return [...ordersList].sort((a, b) => {
      // First sort by urgency
      const urgencyPriority = { high: 0, medium: 1, low: 2 };
      const urgencyA = urgencyPriority[a.urgency] || 1;
      const urgencyB = urgencyPriority[b.urgency] || 1;
      
      if (urgencyA !== urgencyB) {
        return urgencyA - urgencyB;
      }
      
      // Then sort by order time (oldest first)
      return new Date(a.orderTime) - new Date(b.orderTime);
    });
  };

  // Pull-to-refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  // Calculate due time
  const calculateDueTime = (orderTime, prepTime) => {
    const orderDate = new Date(orderTime);
    const dueDate = new Date(orderDate.getTime() + (prepTime * 60000));
    return dueDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Toggle completion status of a pizza in an order
  const togglePizzaCooked = async (orderId, pizzaIndex, currentCookedStatus) => {
    try {
      // Find the order
      const orderToUpdate = orders.find(o => o.id === orderId || o.orderId === orderId);
      if (!orderToUpdate) return;
      
      // Create a copy of the cooked array or initialize it if it doesn't exist
      const newCookedArray = [...(orderToUpdate.cooked || Array(orderToUpdate.pizzas.length).fill(false))];
      
      // Toggle the status of the specified pizza
      newCookedArray[pizzaIndex] = !currentCookedStatus;
      
      // Determine the new order status based on whether all pizzas are cooked
      const allCooked = newCookedArray.every(status => status === true);
      const newStatus = allCooked ? 'ready' : 'cooking';
      
      // Optimistically update the UI
      const updatedOrders = orders.map(order => {
        if (order.id === orderId || order.orderId === orderId) {
          return {
            ...order,
            cooked: newCookedArray,
            status: newStatus
          };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      
      // Call API to update the pizza status
      const result = await ApiService.updatePizzaStatus(orderId, newCookedArray, newStatus);
      
      if (result.error) {
        // Revert the UI if there was an error
        Alert.alert('Error', result.message);
        loadOrders(false);
      }
    } catch (error) {
      console.error('Error toggling pizza status:', error);
      Alert.alert('Error', 'Failed to update pizza status');
      loadOrders(false);
    }
  };

  // Render each order card
  const renderOrder = (order) => {
    const orderId = order.id || order.orderId;
    const dueTime = calculateDueTime(order.orderTime, order.prepTime || 15);
    
    // Determine if the order is late
    const now = new Date();
    const dueDate = new Date(order.orderTime);
    dueDate.setMinutes(dueDate.getMinutes() + (order.prepTime || 15));
    const isLate = now > dueDate;
    
    return (
      <Card 
        key={orderId} 
        style={[
          styles.orderCard,
          isLate && styles.lateOrderCard
        ]}
        mode="outlined"
      >
        <Card.Content>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderId}>Order #{orderId}</Text>
              <Text style={styles.dueTime}>Due by: {dueTime}</Text>
            </View>
            
            <Chip
              mode="outlined"
              style={{
                borderColor: isLate ? '#F44336' : '#2196F3',
                backgroundColor: isLate ? 'rgba(244, 67, 54, 0.1)' : 'transparent'
              }}
              textStyle={{
                color: isLate ? '#F44336' : '#2196F3',
              }}
            >
              {isLate ? 'LATE' : 'ON TIME'}
            </Chip>
          </View>
          
          <View style={styles.customerSection}>
            <Text style={styles.customerName}>
              {order.customerName || 'Anonymous Customer'}
            </Text>
            <Text style={styles.platformText}>
              Via: {order.platform || 'Walk-in'}
            </Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.pizzasSectionTitle}>Pizzas:</Text>
          
          {order.pizzas.map((pizza, index) => {
            const cooked = order.cooked ? order.cooked[index] : false;
            
            return (
              <View key={`${orderId}-pizza-${index}`} style={styles.pizzaItem}>
                <View style={styles.pizzaInfo}>
                  <Text style={styles.pizzaText}>
                    {pizza.quantity}x {pizza.pizzaType}
                  </Text>
                  
                  {/* Special instructions */}
                  {(pizza.specialInstructions || pizza.notes) && (
                    <Text style={styles.specialInstructions}>
                      {pizza.specialInstructions || pizza.notes}
                    </Text>
                  )}
                </View>
                
                <Checkbox
                  status={cooked ? 'checked' : 'unchecked'}
                  onPress={() => togglePizzaCooked(orderId, index, cooked)}
                  color={theme.colors.primary}
                />
              </View>
            );
          })}
          
          {/* Extra toppings section */}
          {order.extraToppings && (
            <View style={styles.extraToppingsSection}>
              <Text style={styles.extraToppingsTitle}>Extra Toppings/Notes:</Text>
              <Text style={styles.extraToppingsText}>{order.extraToppings}</Text>
            </View>
          )}
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.headerContainer}>
        <Text style={styles.header}>John Dough's Kitchen Display</Text>
        <Text style={styles.subheader}>
          {orders.length} Active {orders.length === 1 ? 'Order' : 'Orders'}
        </Text>
      </View>
      
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No active orders in the kitchen</Text>
          <Text style={styles.emptySubtext}>Pull down to refresh</Text>
        </View>
      ) : (
        <View style={styles.ordersList}>
          {orders.map(renderOrder)}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  headerContainer: {
    marginBottom: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e76f51',
    textAlign: 'center',
  },
  subheader: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  ordersList: {
    marginTop: 8,
  },
  orderCard: {
    marginBottom: 16,
    borderRadius: 8,
  },
  lateOrderCard: {
    borderColor: '#F44336',
    borderWidth: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dueTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  customerSection: {
    marginBottom: 8,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '500',
  },
  platformText: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    marginVertical: 8,
  },
  pizzasSectionTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  pizzaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  pizzaInfo: {
    flex: 1,
  },
  pizzaText: {
    fontSize: 15,
  },
  specialInstructions: {
    fontSize: 13,
    color: '#e76f51',
    fontStyle: 'italic',
    marginTop: 2,
  },
  extraToppingsSection: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(231, 111, 81, 0.1)',
    borderRadius: 4,
  },
  extraToppingsTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  extraToppingsText: {
    fontSize: 13,
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
    paddingVertical: 64,
    alignItems: 'center',
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

export default KitchenScreen;
