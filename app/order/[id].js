import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Text, Surface, Divider, Card, Button, Chip, List, useTheme } from 'react-native-paper';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { getOrderById, subscribeToOrder } from '../../src/firebase/orders';
import { useAuth } from '../../src/context/AuthContext';

const OrderStatusColors = {
  pending: '#FFC107',    // Amber
  processing: '#2196F3', // Blue
  shipped: '#9C27B0',    // Purple
  delivered: '#4CAF50',  // Green
  cancelled: '#F44336',  // Red
};

const OrderStatusSteps = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: 4,
};

const OrderTracker = ({ status }) => {
  const theme = useTheme();
  const currentStep = OrderStatusSteps[status] || 0;
  const isCancelled = status === 'cancelled';
  
  return (
    <Surface style={styles.trackerContainer}>
      <View style={styles.stepContainer}>
        {/* Pending */}
        <View style={styles.stepIconContainer}>
          <View 
            style={[
              styles.stepIcon, 
              { backgroundColor: currentStep >= 0 ? OrderStatusColors.pending : theme.colors.surfaceVariant }
            ]}
          >
            <MaterialIcons 
              name="receipt" 
              size={20} 
              color="white" 
            />
          </View>
          <Text style={styles.stepLabel}>Confirmed</Text>
        </View>
        
        {/* Line */}
        <View 
          style={[
            styles.stepLine, 
            { 
              backgroundColor: currentStep >= 1 ? OrderStatusColors.processing : theme.colors.surfaceVariant,
              opacity: isCancelled ? 0.3 : 1,
            }
          ]}
        />
        
        {/* Processing */}
        <View style={styles.stepIconContainer}>
          <View 
            style={[
              styles.stepIcon, 
              { 
                backgroundColor: currentStep >= 1 ? OrderStatusColors.processing : theme.colors.surfaceVariant,
                opacity: isCancelled ? 0.3 : 1, 
              }
            ]}
          >
            <MaterialIcons 
              name="restaurant" 
              size={20} 
              color="white" 
            />
          </View>
          <Text style={[styles.stepLabel, { opacity: isCancelled ? 0.3 : 1 }]}>Preparing</Text>
        </View>
        
        {/* Line */}
        <View 
          style={[
            styles.stepLine, 
            { 
              backgroundColor: currentStep >= 2 ? OrderStatusColors.shipped : theme.colors.surfaceVariant,
              opacity: isCancelled ? 0.3 : 1,
            }
          ]}
        />
        
        {/* Shipped */}
        <View style={styles.stepIconContainer}>
          <View 
            style={[
              styles.stepIcon, 
              { 
                backgroundColor: currentStep >= 2 ? OrderStatusColors.shipped : theme.colors.surfaceVariant,
                opacity: isCancelled ? 0.3 : 1,
              }
            ]}
          >
            <MaterialIcons 
              name="local-shipping" 
              size={20} 
              color="white" 
            />
          </View>
          <Text style={[styles.stepLabel, { opacity: isCancelled ? 0.3 : 1 }]}>On the way</Text>
        </View>
        
        {/* Line */}
        <View 
          style={[
            styles.stepLine, 
            { 
              backgroundColor: currentStep >= 3 ? OrderStatusColors.delivered : theme.colors.surfaceVariant,
              opacity: isCancelled ? 0.3 : 1,
            }
          ]}
        />
        
        {/* Delivered */}
        <View style={styles.stepIconContainer}>
          <View 
            style={[
              styles.stepIcon, 
              { 
                backgroundColor: currentStep >= 3 ? OrderStatusColors.delivered : theme.colors.surfaceVariant,
                opacity: isCancelled ? 0.3 : 1,
              }
            ]}
          >
            <MaterialIcons 
              name="check-circle" 
              size={20} 
              color="white" 
            />
          </View>
          <Text style={[styles.stepLabel, { opacity: isCancelled ? 0.3 : 1 }]}>Delivered</Text>
        </View>
      </View>
      
      {isCancelled && (
        <View style={styles.cancelledContainer}>
          <Chip 
            icon="cancel" 
            style={{ backgroundColor: OrderStatusColors.cancelled }}
            textStyle={{ color: 'white' }}
          >
            Order Cancelled
          </Chip>
        </View>
      )}
    </Surface>
  );
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  useEffect(() => {
    if (!id) return;
    
    let unsubscribe;
    
    const fetchOrder = async () => {
      setLoading(true);
      try {
        // First get the initial data
        const initialOrder = await getOrderById(id);
        setOrder(initialOrder);
        
        // Then subscribe to real-time updates
        unsubscribe = subscribeToOrder(id, (updatedOrder) => {
          if (updatedOrder) {
            setOrder(updatedOrder);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Error fetching order:', error);
        setLoading(false);
      }
    };
    
    fetchOrder();
    
    // Cleanup subscription
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [id]);
  
  const getStatusColor = (status) => {
    return OrderStatusColors[status] || theme.colors.primary;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }
  
  if (!order) {
    return (
      <View style={styles.centered}>
        <Text>Order not found</Text>
        <Button 
          mode="contained" 
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: `Order #${id.substring(0, 8)}`,
          headerRight: () => (
            <Button 
              onPress={() => router.push('/support')}
              mode="text"
            >
              Help
            </Button>
          ),
        }} 
      />
      
      <Surface style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text variant="titleLarge" style={styles.orderId}>
            Order #{order.id.substring(0, 8)}
          </Text>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(order.status) }]}
            textStyle={{ color: 'white' }}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Chip>
        </View>
        
        <Text style={styles.dateText}>
          Placed on {formatDate(order.createdAt)}
        </Text>
      </Surface>
      
      <OrderTracker status={order.status} />
      
      <Surface style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Delivery Information
        </Text>
        <Divider style={styles.divider} />
        
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={20} color={theme.colors.primary} />
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>{order.deliveryDetails?.name || 'N/A'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="phone" size={20} color={theme.colors.primary} />
          <Text style={styles.infoLabel}>Phone:</Text>
          <Text style={styles.infoValue}>{order.deliveryDetails?.phone || 'N/A'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={20} color={theme.colors.primary} />
          <Text style={styles.infoLabel}>Address:</Text>
          <Text style={styles.infoValue}>
            {order.deliveryDetails?.address || 'N/A'}
          </Text>
        </View>
        
        {order.deliveryDetails?.instructions && (
          <View style={styles.infoRow}>
            <MaterialIcons name="info" size={20} color={theme.colors.primary} />
            <Text style={styles.infoLabel}>Instructions:</Text>
            <Text style={styles.infoValue}>
              {order.deliveryDetails.instructions}
            </Text>
          </View>
        )}
      </Surface>
      
      <Surface style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Order Items
        </Text>
        <Divider style={styles.divider} />
        
        {order.items && order.items.length > 0 ? (
          order.items.map((item, index) => (
            <View key={index}>
              <View style={styles.itemRow}>
                {item.imageUrl ? (
                  <Image 
                    source={{ uri: item.imageUrl }} 
                    style={styles.itemImage} 
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <MaterialIcons name="fastfood" size={24} color="#bdbdbd" />
                  </View>
                )}
                
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                  {item.options && (
                    <Text style={styles.itemOptions}>
                      {item.options.join(', ')}
                    </Text>
                  )}
                </View>
                
                <View style={styles.quantityContainer}>
                  <Text style={styles.quantity}>x{item.quantity}</Text>
                  <Text style={styles.itemTotal}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
              
              {index < order.items.length - 1 && (
                <Divider style={styles.itemDivider} />
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noItems}>No items in this order</Text>
        )}
      </Surface>
      
      <Surface style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Payment Summary
        </Text>
        <Divider style={styles.divider} />
        
        <View style={styles.summaryRow}>
          <Text>Subtotal</Text>
          <Text>${order.subtotal?.toFixed(2) || '0.00'}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text>Delivery Fee</Text>
          <Text>${order.deliveryFee?.toFixed(2) || '0.00'}</Text>
        </View>
        
        {order.discount > 0 && (
          <View style={styles.summaryRow}>
            <Text>Discount</Text>
            <Text style={{ color: theme.colors.error }}>
              -${order.discount.toFixed(2)}
            </Text>
          </View>
        )}
        
        <View style={styles.summaryRow}>
          <Text>Tax</Text>
          <Text>${order.tax?.toFixed(2) || '0.00'}</Text>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text variant="titleMedium">Total</Text>
          <Text variant="titleMedium" style={styles.totalAmount}>
            ${order.totalAmount?.toFixed(2) || '0.00'}
          </Text>
        </View>
        
        <View style={styles.paymentMethod}>
          <MaterialIcons name="payment" size={20} color={theme.colors.primary} />
          <Text style={styles.paymentText}>
            {order.paymentMethod || 'Payment Method Not Available'}
          </Text>
        </View>
      </Surface>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          icon="refresh"
          onPress={() => {
            // Refresh order details (subscription should handle this, but just in case)
            getOrderById(id).then(setOrder);
          }}
          style={styles.refreshButton}
        >
          Refresh Status
        </Button>
        
        <Button 
          mode="outlined"
          icon="message"
          onPress={() => router.push('/support')}
          style={styles.supportButton}
        >
          Contact Support
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  headerCard: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontWeight: 'bold',
  },
  statusChip: {
    height: 28,
  },
  dateText: {
    marginTop: 8,
    opacity: 0.7,
  },
  section: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    marginLeft: 8,
    marginRight: 8,
    opacity: 0.7,
    width: 70,
  },
  infoValue: {
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemPrice: {
    marginBottom: 4,
  },
  itemOptions: {
    fontSize: 12,
    opacity: 0.7,
  },
  quantityContainer: {
    alignItems: 'flex-end',
  },
  quantity: {
    marginBottom: 4,
  },
  itemTotal: {
    fontWeight: 'bold',
  },
  itemDivider: {
    marginVertical: 12,
  },
  noItems: {
    fontStyle: 'italic',
    opacity: 0.7,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalRow: {
    marginTop: 8,
    marginBottom: 16,
  },
  totalAmount: {
    fontWeight: 'bold',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: {
    marginLeft: 8,
    opacity: 0.7,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  refreshButton: {
    flex: 1,
    marginRight: 8,
  },
  supportButton: {
    flex: 1,
    marginLeft: 8,
  },
  trackerContainer: {
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepIconContainer: {
    alignItems: 'center',
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  stepLine: {
    flex: 1,
    height: 3,
    marginHorizontal: 4,
  },
  cancelledContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
});
