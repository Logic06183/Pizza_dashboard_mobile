import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Divider, Button, Chip, Dialog, Portal, Paragraph } from 'react-native-paper';
import ApiService from '../api/ApiService';

const OrderDetailsScreen = ({ route, navigation }) => {
  const { order } = route.params;
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, action: null });

  // Format date and time
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // Calculate due time
  const calculateDueTime = (orderTime, prepTime) => {
    const orderDate = new Date(orderTime);
    const dueDate = new Date(orderDate.getTime() + (prepTime * 60000));
    return dueDate.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#2196F3';
      case 'cooking':
        return '#FF9800';
      case 'ready':
        return '#4CAF50';
      case 'delivered':
        return '#9E9E9E';
      default:
        return '#2196F3';
    }
  };

  // Handle marking order as delivered
  const markAsDelivered = async () => {
    try {
      setLoading(true);
      
      const result = await ApiService.updateOrder(
        order.id || order.orderId, 
        { 
          status: 'delivered',
          completed: true
        }
      );
      
      if (result.error) {
        Alert.alert('Error', result.message);
      } else {
        Alert.alert(
          'Success', 
          'Order has been marked as delivered',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      Alert.alert('Error', 'Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  // Handle archiving order
  const archiveOrder = async () => {
    try {
      setLoading(true);
      
      const result = await ApiService.archiveOrder(order.id || order.orderId);
      
      if (result.error) {
        Alert.alert('Error', result.message);
      } else {
        Alert.alert(
          'Success', 
          'Order has been archived',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error archiving order:', error);
      Alert.alert('Error', 'Failed to archive order');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total
  const calculateTotal = () => {
    return order.pizzas.reduce((sum, pizza) => {
      return sum + (pizza.totalPrice || 0);
    }, 0);
  };

  // Open confirmation dialog
  const openConfirmDialog = (action) => {
    const dialogConfig = {
      visible: true,
      action,
      title: '',
      message: ''
    };
    
    if (action === 'deliver') {
      dialogConfig.title = 'Mark as Delivered';
      dialogConfig.message = 'Are you sure you want to mark this order as delivered?';
    } else if (action === 'archive') {
      dialogConfig.title = 'Archive Order';
      dialogConfig.message = 'Are you sure you want to archive this order? This will remove it from the active orders list.';
    }
    
    setConfirmDialog(dialogConfig);
  };

  // Handle dialog confirmation
  const handleConfirm = () => {
    if (confirmDialog.action === 'deliver') {
      markAsDelivered();
    } else if (confirmDialog.action === 'archive') {
      archiveOrder();
    }
    
    setConfirmDialog({ visible: false, action: null });
  };

  // Handle dialog dismissal
  const handleDismiss = () => {
    setConfirmDialog({ visible: false, action: null });
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View>
              <Text style={styles.orderId}>Order #{order.id || order.orderId}</Text>
              <Text style={styles.orderTime}>Placed: {formatDateTime(order.orderTime)}</Text>
            </View>
            
            <Chip 
              mode="outlined" 
              style={{ borderColor: getStatusColor(order.status) }}
              textStyle={{ color: getStatusColor(order.status) }}
            >
              {order.status?.toUpperCase() || 'PENDING'}
            </Chip>
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Customer Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <Text style={styles.infoText}>Name: {order.customerName || 'Anonymous'}</Text>
            <Text style={styles.infoText}>Platform: {order.platform || 'Walk-in'}</Text>
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Timing Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Timing</Text>
            <View style={styles.timingInfo}>
              <View style={styles.timingItem}>
                <Text style={styles.timingLabel}>Ordered At:</Text>
                <Text style={styles.timingValue}>{formatDateTime(order.orderTime)}</Text>
              </View>
              
              <View style={styles.timingItem}>
                <Text style={styles.timingLabel}>Prep Time:</Text>
                <Text style={styles.timingValue}>{order.prepTime || 15} min</Text>
              </View>
              
              <View style={styles.timingItem}>
                <Text style={styles.timingLabel}>Due By:</Text>
                <Text style={styles.timingValue}>
                  {calculateDueTime(order.orderTime, order.prepTime || 15)}
                </Text>
              </View>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Pizza List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            
            {order.pizzas.map((pizza, index) => {
              const isCompleted = order.cooked ? order.cooked[index] : false;
              
              return (
                <View key={index} style={styles.pizzaItem}>
                  <View style={styles.pizzaInfo}>
                    <Text style={styles.pizzaName}>
                      {pizza.quantity}x {pizza.pizzaType}
                    </Text>
                    
                    {(pizza.specialInstructions || pizza.notes) && (
                      <Text style={styles.specialInstructions}>
                        {pizza.specialInstructions || pizza.notes}
                      </Text>
                    )}
                  </View>
                  
                  <View style={styles.pizzaPrice}>
                    <Text>R{pizza.totalPrice || 0}</Text>
                    {isCompleted && (
                      <Chip size="small" style={styles.cookedChip}>Cooked</Chip>
                    )}
                  </View>
                </View>
              );
            })}
            
            {/* Extra Toppings Section */}
            {order.extraToppings && (
              <View style={styles.extraToppingsContainer}>
                <Text style={styles.extraToppingsTitle}>Extra Toppings/Notes:</Text>
                <Text style={styles.extraToppingsText}>{order.extraToppings}</Text>
              </View>
            )}
            
            {/* Order Total */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Order Total:</Text>
              <Text style={styles.totalAmount}>R{calculateTotal()}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
      
      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button 
          mode="contained" 
          style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
          labelStyle={styles.actionButtonLabel}
          onPress={() => openConfirmDialog('deliver')}
          loading={loading}
          disabled={loading || order.status === 'delivered'}
        >
          Mark as Delivered
        </Button>
        
        <Button 
          mode="outlined" 
          style={styles.actionButton}
          onPress={() => openConfirmDialog('archive')}
          loading={loading}
          disabled={loading}
        >
          Archive Order
        </Button>
      </View>
      
      {/* Confirmation Dialog */}
      <Portal>
        <Dialog visible={confirmDialog.visible} onDismiss={handleDismiss}>
          <Dialog.Title>{confirmDialog.title}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{confirmDialog.message}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleDismiss}>Cancel</Button>
            <Button onPress={handleConfirm}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#e76f51',
  },
  infoText: {
    fontSize: 15,
    marginBottom: 4,
  },
  timingInfo: {
    marginTop: 8,
  },
  timingItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timingLabel: {
    width: 100,
    fontSize: 14,
    color: '#666',
  },
  timingValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  pizzaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pizzaInfo: {
    flex: 1,
    paddingRight: 8,
  },
  pizzaName: {
    fontSize: 15,
    fontWeight: '500',
  },
  specialInstructions: {
    fontSize: 13,
    color: '#e76f51',
    fontStyle: 'italic',
    marginTop: 4,
  },
  pizzaPrice: {
    alignItems: 'flex-end',
  },
  cookedChip: {
    marginTop: 4,
    backgroundColor: '#E8F5E9',
    height: 24,
  },
  extraToppingsContainer: {
    marginTop: 16,
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
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e76f51',
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 32,
  },
  actionButton: {
    marginBottom: 8,
    borderRadius: 4,
  },
  actionButtonLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default OrderDetailsScreen;
