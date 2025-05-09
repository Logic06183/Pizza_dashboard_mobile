import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Card, Badge, Chip, Divider, Button, useTheme, Searchbar, Menu } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { subscribeToOrderUpdates, getOrderStats } from '../../src/firebase/pizzaDashboard';
import { useAuth } from '../../src/context/AuthContext';

// Status colors same as the web dashboard for consistency
const OrderStatusColors = {
  pending: '#FFC107',    // Amber
  processing: '#2196F3', // Blue
  completed: '#4CAF50',  // Green
  delivered: '#9C27B0',  // Purple
  cancelled: '#F44336',  // Red
};

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <Card style={[styles.statsCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <Card.Content style={styles.statsContent}>
        <MaterialIcons name={icon} size={24} color={color} />
        <View style={styles.statsTextContainer}>
          <Text style={styles.statsValue}>{value}</Text>
          <Text style={styles.statsTitle}>{title}</Text>
        </View>
      </Card.Content>
    </Card>
  );
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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card style={styles.orderCard} onPress={() => onPress(order)}>
      <Card.Content>
        <View style={styles.orderHeader}>
          <View>
            <Text variant="titleMedium" style={styles.orderId}>
              Order #{order.id.substring(0, 6)}
            </Text>
            <Text style={styles.orderDate}>
              {formatDate(order.createdAt)}
            </Text>
          </View>
          
          <Chip
            style={{ backgroundColor: statusColor }}
            textStyle={{ color: 'white' }}
          >
            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
          </Chip>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.orderInfo}>
          <View style={styles.orderInfoRow}>
            <MaterialIcons name="person" size={16} color={theme.colors.primary} />
            <Text style={styles.orderInfoLabel}>Customer:</Text>
            <Text style={styles.orderInfoValue}>{order.customerName || 'N/A'}</Text>
          </View>
          
          <View style={styles.orderInfoRow}>
            <MaterialIcons name="local-pizza" size={16} color={theme.colors.primary} />
            <Text style={styles.orderInfoLabel}>Items:</Text>
            <Text style={styles.orderInfoValue}>{order.items?.length || 0} items</Text>
          </View>
          
          <View style={styles.orderInfoRow}>
            <MaterialIcons name="attach-money" size={16} color={theme.colors.primary} />
            <Text style={styles.orderInfoLabel}>Total:</Text>
            <Text style={styles.orderInfoValue}>${order.totalAmount?.toFixed(2) || '0.00'}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

export default function DashboardScreen() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    ordersByStatus: {},
    totalRevenue: 0,
    todayRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  
  useEffect(() => {
    // Subscribe to real-time updates from Firestore
    const unsubscribe = subscribeToOrderUpdates((newOrders) => {
      setOrders(newOrders);
      applyFilters(newOrders, statusFilter, searchQuery);
      setLoading(false);
      setRefreshing(false);
    });
    
    // Fetch statistics
    fetchStats();
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Apply filters when status filter or search query changes
  useEffect(() => {
    applyFilters(orders, statusFilter, searchQuery);
  }, [statusFilter, searchQuery]);
  
  const fetchStats = async () => {
    try {
      const stats = await getOrderStats();
      setStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  
  const applyFilters = (orders, status, query) => {
    let result = [...orders];
    
    // Apply status filter
    if (status !== 'all') {
      result = result.filter(order => order.status === status);
    }
    
    // Apply search filter
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      result = result.filter(order => 
        (order.id && order.id.toLowerCase().includes(lowercaseQuery)) ||
        (order.customerName && order.customerName.toLowerCase().includes(lowercaseQuery)) ||
        (order.customerPhone && order.customerPhone.includes(lowercaseQuery))
      );
    }
    
    setFilteredOrders(result);
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
    // Real-time subscription will handle refreshing orders
  };
  
  const handleOrderPress = (order) => {
    router.push(`/order/${order.id}`);
  };
  
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };
  
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };
  
  const selectStatusFilter = (status) => {
    setStatusFilter(status);
    setMenuVisible(false);
  };
  
  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Pizza Dashboard
        </Text>
      </View>
      
      <View style={styles.statsContainer}>
        <StatsCard 
          title="Today's Orders" 
          value={stats.todayOrders} 
          icon="today" 
          color="#2196F3" 
        />
        <StatsCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          icon="list-alt" 
          color="#4CAF50" 
        />
      </View>
      
      <View style={styles.statsContainer}>
        <StatsCard 
          title="Today's Revenue" 
          value={`$${stats.todayRevenue?.toFixed(2) || '0.00'}`} 
          icon="payments" 
          color="#FF9800" 
        />
        <StatsCard 
          title="Total Revenue" 
          value={`$${stats.totalRevenue?.toFixed(2) || '0.00'}`}
          icon="account-balance" 
          color="#9C27B0" 
        />
      </View>
      
      <View style={styles.filterContainer}>
        <Searchbar
          placeholder="Search orders..."
          onChangeText={handleSearchChange}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <Menu
          visible={menuVisible}
          onDismiss={toggleMenu}
          anchor={
            <Button 
              mode="outlined" 
              onPress={toggleMenu}
              style={styles.filterButton}
              icon="filter-list"
            >
              {statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            </Button>
          }
        >
          <Menu.Item onPress={() => selectStatusFilter('all')} title="All Status" />
          <Menu.Item onPress={() => selectStatusFilter('pending')} title="Pending" />
          <Menu.Item onPress={() => selectStatusFilter('processing')} title="Processing" />
          <Menu.Item onPress={() => selectStatusFilter('completed')} title="Completed" />
          <Menu.Item onPress={() => selectStatusFilter('delivered')} title="Delivered" />
          <Menu.Item onPress={() => selectStatusFilter('cancelled')} title="Cancelled" />
        </Menu>
      </View>
      
      <View style={styles.ordersContainer}>
        <View style={styles.ordersHeader}>
          <Text variant="titleMedium" style={styles.ordersTitle}>
            Recent Orders
          </Text>
          <Text style={styles.orderCount}>
            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
          </Text>
        </View>
        
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inbox" size={48} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.emptyText}>No orders found</Text>
            {searchQuery || statusFilter !== 'all' ? (
              <Button 
                mode="outlined" 
                onPress={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                style={{ marginTop: 16 }}
              >
                Clear Filters
              </Button>
            ) : null}
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <OrderItem order={item} onPress={handleOrderPress} />
            )}
            contentContainerStyle={styles.ordersList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
    </View>
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
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsTextContainer: {
    marginLeft: 8,
  },
  statsTitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  statsValue: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    height: 40,
    marginRight: 8,
  },
  filterButton: {
    height: 40,
    justifyContent: 'center',
  },
  ordersContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 0,
  },
  ordersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ordersTitle: {
    fontWeight: 'bold',
  },
  orderCount: {
    opacity: 0.7,
  },
  ordersList: {
    paddingBottom: 16,
  },
  orderCard: {
    marginBottom: 12,
    borderRadius: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  divider: {
    marginVertical: 12,
  },
  orderInfo: {
    marginTop: 4,
  },
  orderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderInfoLabel: {
    marginLeft: 8,
    width: 70,
    opacity: 0.7,
  },
  orderInfoValue: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    marginTop: 16,
    opacity: 0.7,
  },
});
