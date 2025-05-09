import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Text, Card, Button, Chip, Divider, useTheme, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ApiService from '../src/api/ApiService';
import ViewFix from '../src/components/ViewFix';

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

export default function OrderDetailsScreen() {
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Get all orders and find the matching one
      const orders = await ApiService.getOrders();
      
      if (orders.error) {
        Alert.alert('Error', 'Failed to load order details');
        return;
      }
      
      const foundOrder = orders.find((o: Order) => 
        (o.id === orderId || o.orderId === orderId)
      );
      
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        Alert.alert('Error', 'Order not found');
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return;
    
    try {
      const updatedOrder = { ...order, status: newStatus };
      
      const result = await ApiService.updateOrder(
        order.id || order.orderId || '',
        updatedOrder
      );
      
      if (result.error) {
        Alert.alert('Error', 'Failed to update order status');
      } else {
        setOrder(updatedOrder);
        Alert.alert('Success', `Order status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  // Archive order
  const archiveOrder = async () => {
    if (!order) return;
    
    Alert.alert(
      'Archive Order',
      'Are you sure you want to archive this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          onPress: async () => {
            try {
              const result = await ApiService.archiveOrder(
                order.id || order.orderId || ''
              );
              
              if (result.error) {
                Alert.alert('Error', 'Failed to archive order');
              } else {
                Alert.alert('Success', 'Order archived successfully');
                router.back();
              }
            } catch (error) {
              console.error('Error archiving order:', error);
              Alert.alert('Error', 'Failed to archive order');
            }
          }
        }
      ]
    );
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

  // Format order date
  const formatOrderDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#2196F3';
      case 'in-progress':
        return '#FF9800';
      case 'completed':
        return '#4CAF50';
      case 'delivered':
        return '#9C27B0';
      case 'cancelled':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16 }}>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Order not found</Text>
        <Button mode="contained" onPress={() => router.back()} style={{ marginTop: 16 }}>
          Go Back
        </Button>
      </View>
    );
  }

  const totalPizzas = order.pizzas.reduce((sum, pizza) => sum + pizza.quantity, 0);
  const dueTime = calculateDueTime(order.orderTime, order.prepTime || 15);
  const statusColor = getStatusColor(order.status);

  return (
    <ViewFix style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.header}>
          <Card.Content>
            <ViewFix style={styles.orderIdRow}>
              <Text style={styles.orderId}>Order #{order.orderId || order.id}</Text>
              <Chip 
                mode="outlined" 
                textStyle={{ color: statusColor }}
                style={{ borderColor: statusColor }}
              >
                {order.status.toUpperCase()}
              </Chip>
            </ViewFix>
            
            <ViewFix style={styles.timeRow}>
              <ViewFix>
                <Text style={styles.timeLabel}>Ordered On</Text>
                <Text style={styles.timeValue}>
                  {formatOrderDate(order.orderTime)} at {formatOrderTime(order.orderTime)}
                </Text>
              </ViewFix>
              <ViewFix>
                <Text style={styles.timeLabel}>Due By</Text>
                <Text style={styles.timeValue}>{dueTime}</Text>
              </ViewFix>
            </ViewFix>
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Title title="Customer Information" />
          <Card.Content>
            <ViewFix style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{order.customerName || 'Walk-in Customer'}</Text>
            </ViewFix>
            <ViewFix style={styles.infoRow}>
              <Text style={styles.infoLabel}>Platform:</Text>
              <Text style={styles.infoValue}>{order.platform || 'Walk-in'}</Text>
            </ViewFix>
            <ViewFix style={styles.infoRow}>
              <Text style={styles.infoLabel}>Prep Time:</Text>
              <Text style={styles.infoValue}>{order.prepTime || 15} minutes</Text>
            </ViewFix>
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Title 
            title="Order Items" 
            right={() => (
              <Text style={styles.totalItems}>{totalPizzas} {totalPizzas === 1 ? 'Item' : 'Items'}</Text>
            )}
          />
          <Card.Content>
            {order.pizzas.map((pizza, index) => (
              <ViewFix key={`pizza-${index}`}>
                {index > 0 && <Divider style={styles.divider} />}
                <ViewFix style={styles.pizzaItem}>
                  <ViewFix style={styles.pizzaHeader}>
                    <Text style={styles.pizzaName}>{pizza.name}</Text>
                    <Text style={styles.pizzaQuantity}>x{pizza.quantity}</Text>
                  </ViewFix>
                  
                  {pizza.isCooked !== undefined && (
                    <ViewFix style={styles.pizzaStatus}>
                      <Text style={styles.statusLabel}>Status:</Text>
                      <Text style={[
                        styles.statusValue, 
                        { color: pizza.isCooked ? '#4CAF50' : '#FF9800' }
                      ]}>
                        {pizza.isCooked ? 'Cooked' : 'Cooking'}
                      </Text>
                    </ViewFix>
                  )}
                  
                  {pizza.specialInstructions && (
                    <ViewFix style={styles.specialInstructions}>
                      <Text style={styles.instructionsLabel}>Special Instructions:</Text>
                      <Text style={styles.instructionsValue}>{pizza.specialInstructions}</Text>
                    </ViewFix>
                  )}
                </ViewFix>
              </ViewFix>
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Title title="Actions" />
          <Card.Content>
            <View style={styles.actionsContainer}>
              {order.status === 'pending' && (
                <Button 
                  mode="contained"
                  icon="progress-clock"
                  onPress={() => updateOrderStatus('in-progress')}
                  style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                >
                  Start Cooking
                </Button>
              )}
              
              {(order.status === 'pending' || order.status === 'in-progress') && (
                <Button 
                  mode="contained"
                  icon="check-circle"
                  onPress={() => updateOrderStatus('completed')}
                  style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                >
                  Mark Completed
                </Button>
              )}
              
              {(order.status === 'completed') && (
                <Button 
                  mode="contained"
                  icon="truck-delivery"
                  onPress={() => updateOrderStatus('delivered')}
                  style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
                >
                  Mark Delivered
                </Button>
              )}
              
              <Button 
                mode="outlined"
                icon="archive"
                onPress={archiveOrder}
                style={styles.actionButton}
              >
                Archive Order
              </Button>
              
              <Button 
                mode="outlined"
                icon="cancel"
                onPress={() => updateOrderStatus('cancelled')}
                style={[styles.actionButton, { borderColor: '#F44336' }]}
                textColor="#F44336"
              >
                Cancel Order
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </ViewFix>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  orderIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeLabel: {
    fontSize: 14,
    color: '#757575',
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontSize: 14,
    color: '#757575',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalItems: {
    marginRight: 16,
    color: '#757575',
  },
  divider: {
    marginVertical: 12,
  },
  pizzaItem: {
    marginVertical: 4,
  },
  pizzaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pizzaName: {
    fontSize: 16,
    fontWeight: '500',
  },
  pizzaQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pizzaStatus: {
    flexDirection: 'row',
    marginTop: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: '#757575',
    marginRight: 4,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  specialInstructions: {
    backgroundColor: '#FFF8E1',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  instructionsLabel: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
  instructionsValue: {
    fontSize: 14,
    marginTop: 2,
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionButton: {
    marginVertical: 8,
  },
});
