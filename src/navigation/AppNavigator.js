import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import OrdersScreen from '../screens/OrdersScreen';
import KitchenScreen from '../screens/KitchenScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import NewOrderScreen from '../screens/NewOrderScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const OrdersStack = createStackNavigator();
const KitchenStack = createStackNavigator();

// Orders stack navigator
const OrdersStackNavigator = () => {
  return (
    <OrdersStack.Navigator>
      <OrdersStack.Screen 
        name="OrdersList" 
        component={OrdersScreen} 
        options={{ title: 'Orders' }}
      />
      <OrdersStack.Screen 
        name="OrderDetails" 
        component={OrderDetailsScreen} 
        options={{ title: 'Order Details' }}
      />
      <OrdersStack.Screen 
        name="NewOrder" 
        component={NewOrderScreen} 
        options={{ title: 'New Order' }}
      />
    </OrdersStack.Navigator>
  );
};

// Kitchen stack navigator
const KitchenStackNavigator = () => {
  return (
    <KitchenStack.Navigator>
      <KitchenStack.Screen 
        name="KitchenDisplay" 
        component={KitchenScreen} 
        options={{ title: 'Kitchen Display' }}
      />
    </KitchenStack.Navigator>
  );
};

// Main tab navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Orders') {
              iconName = focused ? 'receipt' : 'receipt-outline';
            } else if (route.name === 'Kitchen') {
              iconName = focused ? 'restaurant' : 'restaurant-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#e76f51',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Orders" component={OrdersStackNavigator} />
        <Tab.Screen name="Kitchen" component={KitchenStackNavigator} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
