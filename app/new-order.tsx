import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  ActivityIndicator,
  useTheme,
  SegmentedButtons,
  HelperText,
  Dialog,
  Portal,
  List,
  RadioButton,
  Checkbox,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import ApiService from '../src/api/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

// Types for the pizza menu
type PizzaOption = {
  id: string;
  name: string;
  basePrice: number;
};

type Pizza = {
  pizzaId: string;
  name: string;
  quantity: number;
  specialInstructions?: string;
};

// Delivery service options (matching the web app)
const DELIVERY_OPTIONS = [
  'Window',
  'Uber Eats',
  'Mr D Food',
  'Bolt Food',
  'Customer Pickup',
  'Other',
];

// Default pizza menu - will be updated from the API if available
const DEFAULT_PIZZA_MENU: PizzaOption[] = [
  { id: 'margarita', name: 'Margarita', basePrice: 85 },
  { id: 'pepperoni', name: 'Pepperoni', basePrice: 110 },
  { id: 'vegetarian', name: 'Vegetarian Delight', basePrice: 95 },
  { id: 'fourCheese', name: 'Four Cheese', basePrice: 115 },
  { id: 'hawaiian', name: 'Hawaiian', basePrice: 105 },
  { id: 'bbqChicken', name: 'BBQ Chicken', basePrice: 120 },
];

export default function NewOrderScreen() {
  const theme = useTheme();
  const router = useRouter();

  // Order state
  const [customerName, setCustomerName] = useState('');
  const [platform, setPlatform] = useState('');
  const [prepTime, setPrepTime] = useState('15');
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Pizza menu state
  const [pizzaMenu, setPizzaMenu] = useState<PizzaOption[]>(DEFAULT_PIZZA_MENU);
  const [loadingMenu, setLoadingMenu] = useState(true);
  
  // Dialog states
  const [showPlatformDialog, setShowPlatformDialog] = useState(false);
  const [showAddPizzaDialog, setShowAddPizzaDialog] = useState(false);
  const [showInstructionsDialog, setShowInstructionsDialog] = useState(false);
  
  // Add pizza dialog state
  const [selectedPizzaId, setSelectedPizzaId] = useState('');
  const [selectedPizzaQuantity, setSelectedPizzaQuantity] = useState('1');
  
  // Instructions dialog state
  const [editingPizzaIndex, setEditingPizzaIndex] = useState(-1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Form validation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({
    customerName: false,
    platform: false,
    pizzas: false,
  });

  // Load pizza menu on component mount
  useEffect(() => {
    loadPizzaMenu();
  }, []);

  // Calculate total price when pizzas change
  useEffect(() => {
    let total = 0;
    pizzas.forEach(pizza => {
      const menuItem = pizzaMenu.find(p => p.id === pizza.pizzaId);
      if (menuItem) {
        total += menuItem.basePrice * pizza.quantity;
      }
    });
    setTotalPrice(total);
  }, [pizzas, pizzaMenu]);

  // Load pizza menu from API or local storage
  const loadPizzaMenu = async () => {
    try {
      setLoadingMenu(true);
      
      // Try to load pizza menu from API
      const apiPizzaMenu = await ApiService.getPizzaMenu();
      
      if (!apiPizzaMenu.error && Array.isArray(apiPizzaMenu) && apiPizzaMenu.length > 0) {
        setPizzaMenu(apiPizzaMenu);
      } else {
        // If API fails, try to load from local storage
        const storedMenu = await AsyncStorage.getItem('pizzaMenu');
        if (storedMenu) {
          setPizzaMenu(JSON.parse(storedMenu));
        }
      }
    } catch (error) {
      console.error('Error loading pizza menu:', error);
      // Keep using the default menu
    } finally {
      setLoadingMenu(false);
    }
  };

  // Handle platform selection
  const handlePlatformSelect = (value: string) => {
    setPlatform(value);
    setShowPlatformDialog(false);
    setFormErrors(prev => ({ ...prev, platform: false }));
  };

  // Handle add pizza
  const handleAddPizza = () => {
    if (!selectedPizzaId) {
      Alert.alert('Error', 'Please select a pizza');
      return;
    }

    const quantity = parseInt(selectedPizzaQuantity, 10);
    if (isNaN(quantity) || quantity < 1) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const selectedPizza = pizzaMenu.find(p => p.id === selectedPizzaId);
    if (!selectedPizza) {
      Alert.alert('Error', 'Selected pizza not found in menu');
      return;
    }

    // Add the pizza to the order
    const newPizza: Pizza = {
      pizzaId: selectedPizza.id,
      name: selectedPizza.name,
      quantity,
    };

    setPizzas([...pizzas, newPizza]);
    setFormErrors(prev => ({ ...prev, pizzas: false }));

    // Reset the dialog state
    setSelectedPizzaId('');
    setSelectedPizzaQuantity('1');
    setShowAddPizzaDialog(false);
  };

  // Handle remove pizza
  const handleRemovePizza = (index: number) => {
    const updatedPizzas = [...pizzas];
    updatedPizzas.splice(index, 1);
    setPizzas(updatedPizzas);
    
    if (updatedPizzas.length === 0) {
      setFormErrors(prev => ({ ...prev, pizzas: true }));
    }
  };

  // Open instructions dialog for a pizza
  const openInstructionsDialog = (index: number) => {
    setEditingPizzaIndex(index);
    setSpecialInstructions(pizzas[index].specialInstructions || '');
    setShowInstructionsDialog(true);
  };

  // Save special instructions
  const saveSpecialInstructions = () => {
    if (editingPizzaIndex >= 0 && editingPizzaIndex < pizzas.length) {
      const updatedPizzas = [...pizzas];
      updatedPizzas[editingPizzaIndex] = {
        ...updatedPizzas[editingPizzaIndex],
        specialInstructions: specialInstructions.trim() || undefined,
      };
      setPizzas(updatedPizzas);
    }
    setShowInstructionsDialog(false);
  };

  // Increment pizza quantity
  const incrementQuantity = (index: number) => {
    const updatedPizzas = [...pizzas];
    updatedPizzas[index].quantity += 1;
    setPizzas(updatedPizzas);
  };

  // Decrement pizza quantity
  const decrementQuantity = (index: number) => {
    const updatedPizzas = [...pizzas];
    if (updatedPizzas[index].quantity > 1) {
      updatedPizzas[index].quantity -= 1;
      setPizzas(updatedPizzas);
    }
  };

  // Validate the form
  const validateForm = () => {
    const errors = {
      customerName: !customerName.trim(),
      platform: !platform.trim(),
      pizzas: pizzas.length === 0,
    };
    
    setFormErrors(errors);
    
    return !Object.values(errors).some(error => error);
  };

  // Submit the order
  const submitOrder = async () => {
    if (!validateForm()) {
      Alert.alert('Form Error', 'Please fill in all required fields and add at least one pizza.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const parsedPrepTime = parseInt(prepTime, 10);
      const validPrepTime = !isNaN(parsedPrepTime) && parsedPrepTime > 0 
        ? parsedPrepTime 
        : 15;
      
      const orderData = {
        customerName: customerName.trim(),
        platform,
        prepTime: validPrepTime,
        pizzas,
        orderTime: new Date().toISOString(),
        status: 'pending',
      };
      
      const result = await ApiService.createOrder(orderData);
      
      if (result.error) {
        Alert.alert('Error', result.message || 'Failed to create order');
      } else {
        Alert.alert(
          'Success', 
          'Order created successfully!',
          [
            { 
              text: 'OK', 
              onPress: () => router.back() 
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Error', 'Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <StatusBar style="light" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.section}>
          <Card.Title title="Customer Information" />
          <Card.Content>
            <TextInput
              label="Customer Name"
              value={customerName}
              onChangeText={(text) => {
                setCustomerName(text);
                if (text.trim()) {
                  setFormErrors(prev => ({ ...prev, customerName: false }));
                }
              }}
              mode="outlined"
              error={formErrors.customerName}
              style={styles.input}
            />
            {formErrors.customerName && (
              <HelperText type="error">Customer name is required</HelperText>
            )}
            
            <Text style={styles.inputLabel}>Delivery Platform</Text>
            <TouchableOpacity 
              onPress={() => setShowPlatformDialog(true)}
              style={[
                styles.platformSelector,
                formErrors.platform && styles.errorBorder
              ]}
            >
              <Text style={platform ? styles.platformText : styles.placeholderText}>
                {platform || 'Select a delivery platform'}
              </Text>
              <IconButton icon="chevron-down" size={20} />
            </TouchableOpacity>
            {formErrors.platform && (
              <HelperText type="error">Delivery platform is required</HelperText>
            )}
            
            <TextInput
              label="Preparation Time (minutes)"
              value={prepTime}
              onChangeText={text => {
                // Only allow numbers
                if (/^\d*$/.test(text)) {
                  setPrepTime(text);
                }
              }}
              keyboardType="number-pad"
              mode="outlined"
              style={styles.input}
            />
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Title 
            title="Pizza Order" 
            right={() => (
              <Button 
                mode="contained" 
                onPress={() => setShowAddPizzaDialog(true)}
                style={styles.addButton}
              >
                Add Pizza
              </Button>
            )}
          />
          <Card.Content>
            {pizzas.length === 0 ? (
              <View style={styles.emptyPizzas}>
                <Text style={[styles.emptyText, formErrors.pizzas && styles.errorText]}>
                  No pizzas added yet
                </Text>
                <Button 
                  mode="outlined" 
                  onPress={() => setShowAddPizzaDialog(true)}
                  style={{ marginTop: 8 }}
                >
                  Add Pizza
                </Button>
              </View>
            ) : (
              <View>
                {pizzas.map((pizza, index) => (
                  <Card key={`pizza-${index}`} style={styles.pizzaCard}>
                    <Card.Content>
                      <View style={styles.pizzaHeader}>
                        <Text style={styles.pizzaName}>{pizza.name}</Text>
                        <IconButton
                          icon="delete"
                          size={20}
                          onPress={() => handleRemovePizza(index)}
                        />
                      </View>
                      
                      <View style={styles.pizzaDetails}>
                        <View style={styles.quantityControls}>
                          <IconButton
                            icon="minus"
                            size={20}
                            onPress={() => decrementQuantity(index)}
                            disabled={pizza.quantity <= 1}
                          />
                          <Text style={styles.quantityText}>{pizza.quantity}</Text>
                          <IconButton
                            icon="plus"
                            size={20}
                            onPress={() => incrementQuantity(index)}
                          />
                        </View>
                        
                        <Text style={styles.priceText}>
                          R {(pizzaMenu.find(p => p.id === pizza.pizzaId)?.basePrice || 0) * pizza.quantity}
                        </Text>
                      </View>
                      
                      {pizza.specialInstructions ? (
                        <TouchableOpacity
                          style={styles.instructionsContainer}
                          onPress={() => openInstructionsDialog(index)}
                        >
                          <Text style={styles.instructionsLabel}>Special Instructions:</Text>
                          <Text style={styles.instructionsText}>{pizza.specialInstructions}</Text>
                        </TouchableOpacity>
                      ) : (
                        <Button
                          mode="text"
                          icon="pencil"
                          onPress={() => openInstructionsDialog(index)}
                          style={styles.addInstructionsButton}
                        >
                          Add Special Instructions
                        </Button>
                      )}
                    </Card.Content>
                  </Card>
                ))}
              </View>
            )}
            
            {pizzas.length > 0 && (
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalAmount}>R {totalPrice}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={submitOrder}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.submitButton}
          labelStyle={styles.submitButtonLabel}
        >
          Place Order
        </Button>
      </ScrollView>

      {/* Platform Selection Dialog */}
      <Portal>
        <Dialog visible={showPlatformDialog} onDismiss={() => setShowPlatformDialog(false)}>
          <Dialog.Title>Select Delivery Platform</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={handlePlatformSelect} value={platform}>
              {DELIVERY_OPTIONS.map((option) => (
                <RadioButton.Item 
                  key={option} 
                  label={option} 
                  value={option}
                  style={styles.radioItem} 
                />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPlatformDialog(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Add Pizza Dialog */}
      <Portal>
        <Dialog visible={showAddPizzaDialog} onDismiss={() => setShowAddPizzaDialog(false)}>
          <Dialog.Title>Add Pizza</Dialog.Title>
          <Dialog.Content>
            {loadingMenu ? (
              <ActivityIndicator size="small" style={{ marginVertical: 20 }} />
            ) : (
              <>
                <Text style={styles.dialogLabel}>Select Pizza</Text>
                <RadioButton.Group onValueChange={setSelectedPizzaId} value={selectedPizzaId}>
                  {pizzaMenu.map((pizza) => (
                    <RadioButton.Item 
                      key={pizza.id} 
                      label={`${pizza.name} (R${pizza.basePrice})`}
                      value={pizza.id}
                      style={styles.radioItem} 
                    />
                  ))}
                </RadioButton.Group>
                
                <TextInput
                  label="Quantity"
                  value={selectedPizzaQuantity}
                  onChangeText={text => {
                    // Only allow numbers
                    if (/^\d*$/.test(text)) {
                      setSelectedPizzaQuantity(text);
                    }
                  }}
                  keyboardType="number-pad"
                  mode="outlined"
                  style={[styles.input, { marginTop: 16 }]}
                />
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAddPizzaDialog(false)}>Cancel</Button>
            <Button onPress={handleAddPizza} disabled={loadingMenu || !selectedPizzaId}>
              Add
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Special Instructions Dialog */}
      <Portal>
        <Dialog visible={showInstructionsDialog} onDismiss={() => setShowInstructionsDialog(false)}>
          <Dialog.Title>Special Instructions</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Special Instructions"
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.instructionsInput}
              placeholder="e.g., No onions, extra cheese, well-done, etc."
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowInstructionsDialog(false)}>Cancel</Button>
            <Button onPress={saveSpecialInstructions}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 4,
    color: '#666',
  },
  platformSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 4,
    height: 56,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  errorBorder: {
    borderColor: '#f44336',
  },
  platformText: {
    fontSize: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#9E9E9E',
  },
  addButton: {
    marginRight: 16,
  },
  emptyPizzas: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#757575',
  },
  errorText: {
    color: '#f44336',
  },
  pizzaCard: {
    marginBottom: 12,
  },
  pizzaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pizzaName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pizzaDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    backgroundColor: '#FFF8E1',
    padding: 8,
    borderRadius: 4,
    marginTop: 12,
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
  addInstructionsButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButton: {
    marginTop: 24,
    height: 50,
    justifyContent: 'center',
    backgroundColor: '#e76f51',
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dialogLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  radioItem: {
    paddingVertical: 4,
  },
  instructionsInput: {
    height: 120,
  },
});
